import {Shell, Manager, manager, command} from '../../shell';
import {Project} from '../../project';
import {Builder} from '../../builder';

import * as rt from '@ennube/runtime';
import {Stack} from './cloudformation';
import * as s3 from './s3';
import * as lambda from './lambda';
import * as iam from './iam';
import * as agw from './apigateway';

//import * as YAML from 'js-yaml';
import * as _ from 'lodash';
import * as yaml from 'js-yaml';
import * as fs from 'fs-extra';

import {pascalCase, paramCase} from 'change-case';

@manager(Shell, Project)
export class AWS implements Manager  {

    constructor(public shell:Shell, public project: Project) {
    }

    @command('deploy', 'build, pack, synchronizes and deploy the project')
    deploy(shell:Shell, project: Project, builder: Builder) {

        let stack: Stack;
        let existingBuckets: s3.ListBucketsResult;

        let promise = builder.build()
        .then( () => stack = this.createStack(project) )
        .then( () => fs.writeFileSync(`${project.buildDir}/stack.yml`, yaml.dump(stack.template)) )

        .then( (stack) => s3.listBuckets())
        .then( (result) => existingBuckets = result )
        //.then( (x) => {console.log('Existing buckets', x); return x} )

        // for each sync....

        .then( () =>
            s3.syncBucket({
                sourceDirectory: stack.project.deploymentDir,
                createBucket: !(stack.deploymentBucket in existingBuckets),
                defaultRegion: stack.region,
                bucketName: stack.deploymentBucket,
                destinationDirectory: stack.deploymentPrefix,
            })
        )
        .then(console.log.bind(console))


/*
        .then( (stack) =>
            s3.listBuckets()
            .then( (result) => existingBuckets = result )
            //.then( (x) => {console.log('Existing buckets', x); return x} )
            .then( () =>
                // syncs deployment files..
                s3.syncBucket({
                    sourceDirectory: stack.project.deploymentDir,
                    createBucket: !(stack.deploymentBucket in existingBuckets),
                    defaultRegion: stack.region,
                    bucketName: stack.deploymentBucket,
                    destinationDirectory: stack.deploymentPrefix,
                }))

            .then( () => stack )
        )
        */

        .then( () => stack.update() )
        //.then( () => stack.template)

        // now syncs the static files...

        return promise;
    }


    @command('stack')
    createStack(project:Project) {
        project.ensureLoaded();

        let stage = 'development';

        let stack = new Stack(project, {
            stage: stage,
//          region: ...,
            deploymentBucket: `${paramCase(project.name)}-deployment`,
            deploymentPrefix: `${(new Date()).toJSON()}-${stage}`,
        });

        // Create lambda resources.

        let lambdas: {
            [serviceName:string]: lambda.Function
        } = {};

        let lambdaRoles = [];
        for(let serviceName in rt.allServiceDescriptors) {
            let serviceDescriptor = rt.allServiceDescriptors[serviceName];

            let role = new iam.Role(stack, {
                name: `${serviceName}Execution`,
                policyDocument: {
                    Version: "2012-10-17",
                    Statement: [{
                        Effect: "Allow",
                        Principal: {
                            Service: ["lambda.amazonaws.com"]
                        },
                        Action: ["sts:AssumeRole"]
                    }]
                },
                managedPolicies: [
//                    'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole',
                    'arn:aws:iam::aws:policy/AWSLambdaExecute',
                ].concat(serviceDescriptor.managedPolicies)
            });

            lambdas[serviceName] = new lambda.Function(stack, serviceDescriptor, role);
            lambdaRoles.push(role);
        }
/*
        if(lambdaRoles.length)
            new iam.Policy(stack, 'LambdaLogger', {
                roles: lambdaRoles,
                policyDocument: {
                    Version: '2012-10-17',
                    Statement: [{
                        Effect: "Allow",
                        Action: [
                          "logs:CreateLogGroup",
                          "logs:CreateLogStream",
                          "logs:PutLogEvents"
                        ],
                        Resource: `arn:aws:logs:${stack.region}:*:*`
                    }]
                }
            });
*/

        //
        //   API GATEWAY
        //


        let apiGatewayRoles = [];
        for( let gatewayName in rt.http.allGateways ) {

            let gateway = rt.http.allGateways[gatewayName];
            let restApi = new agw.RestApi(stack, gateway);

            let role = new iam.Role(stack, {
                name: `${pascalCase(project.name)}${pascalCase(gatewayName)}Gateway`,
                policyDocument: {
                    Version: "2012-10-17",
                    Statement: [{
                        Effect: "Allow",
                        Principal: {
                            Service: ["lambda.amazonaws.com"]
                        },
                        Action: ["sts:AssumeRole"]
                    }]
                },
                managedPolicies: [
                    'arn:aws:iam::aws:policy/service-role/AWSLambdaRole'
                ]
            });
            apiGatewayRoles.push(role);

            let endpoints: {
                [url:string]: agw.Endpoint
            } = { };

            for( let url in gateway.endpoints ) {
                let httpMethods = gateway.endpoints[url];

                let requestParameters = {};
                let parentEndpointUrl;
                let parentEndpoint;
                let urlParams = [];
                let urlParts = [];

                url = _.trim(url, '/');
                if(!!url)
                for(let urlPart of url.split('/')) {
                    let paramMatch = /\{([\-\w]+)(\+)?\}/.exec(urlPart);
                    if( paramMatch )
                        urlParams.push(paramMatch[1]);

                    urlParts.push(urlPart)
                    let endpointUrl = urlParts.join('/');
                    let endpoint = endpoints[endpointUrl];
                    if( endpoint === undefined )
                        endpoint = endpoints[endpointUrl] =
                            new agw.Endpoint(restApi, parentEndpoint, urlPart);

                    parentEndpointUrl = endpointUrl;
                    parentEndpoint = endpoint;
                }


                for( let httpMethod in httpMethods ) {
                    let endpoint = httpMethods[httpMethod];
                    let __function = lambdas[endpoint.serviceDescriptor.serviceClass.name];

                    let lambdaMethod = new agw.LambdaMethod(restApi, parentEndpoint, {
                        "function": __function,
                        endpoint,
                        urlParams,
                        httpMethod
                    });

                    new lambda.Permission(stack, {
                        'function': __function,
                        principal: 'apigateway.amazonaws.com',
                        action: 'lambda:InvokeFunction',
                    });
                }
            }

            new agw.Deployment(restApi, {
                variables: {
                    gatewayName
                }
            });
        }
/*
        if(apiGatewayRoles.length)
            new iam.Policy(stack, 'LambdaInvokeFunction', {
                roles: apiGatewayRoles,
                policyDocument: {
                    "Version": "2012-10-17",
                    "Statement": [
                        {
                            "Effect": "Allow",
                            "Action": "lambda:InvokeFunction",
                            "Resource": "*"
                        }
                    ]
                }
            });
*/

        return stack;
    }


}
