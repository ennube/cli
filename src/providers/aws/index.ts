import {Shell, Manager, manager, command} from '../../shell';
import {Project} from '../../project';
import {Builder} from '../../builder';

import * as rt from '@ennube/runtime';
import {Stack} from './cloudformation';
import * as lambda from './lambda';
import * as iam from './iam';
import * as agw from './apigateway';

import * as YAML from 'js-yaml';
import * as _ from 'lodash';

import {pascalCase, paramCase} from 'change-case';

const aws = require('aws-sdk');
const s3 = require('s3');
import * as ProgressBar from 'progress';
import * as chalk from 'chalk';


function send(request: (()=>any)) {
    return new Promise((resolve, reject) => {
        request()
        .on('success', (response) => resolve(response) )
        .on('error', (response) => reject(response) )
        .send();
    });
}


@manager(Shell)
export class Aws implements Manager  {

    constructor(public shell:Shell) {
    }



    @command('deploy')
    deploy(shell:Shell, project: Project, builder: Builder) {

        return builder.build(shell, project)

        .then( () => this.createStack(project) )

        .then( (stack) => this.uploadDeploymentFiles(stack) )

        .then( (stack) => this.updateStack(stack) )
    }


    @command('stack')
    createStack(project:Project) {
        project.ensureLoaded();

        let stack = new Stack(project, {
//          stage: ...,
//          region: ...,
            deploymentBucket: `${paramCase(project.name)}-deployment`,
            deploymentPrefix: `${(new Date()).toJSON()}`,
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
            });

            lambdas[serviceName] = new lambda.Function(stack, serviceDescriptor, role);
            lambdaRoles.push(role);
        }

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


        //
        //   API GATEWAY
        //




        for( let gatewayId in rt.http.allGateways ) {

            let gateway = rt.http.allGateways[gatewayId];
            let restApi = new agw.RestApi(stack, gateway);

            let endpoints: {
                [url:string]: agw.Endpoint
            } = { };

            let methods = [];

            for( let url in gateway.endpoints ) {
                let httpMethods = gateway.endpoints[url];

                // Ensure URL RESOURCE
                let requestParameters = {};
                let parentEndpoint;
                let urlParams = [];
                let urlParts = [];

                url = _.trim(url, '/');
                if(!!url)
                for(let urlPart of url.split('/')) {
                    urlParts.push(urlPart)
                    let endpointUrl = urlParts.join('/');

                    let paramMatch = /\{([\-\w]+)\}/.exec(urlPart);
                    if( paramMatch )
                        urlParams.push(paramMatch[1]);

                    parentEndpoint = endpoints[endpointUrl];
                    if( parentEndpoint === undefined )
                        parentEndpoint = endpoints[endpointUrl] =
                            new agw.Endpoint(restApi, parentEndpoint, urlPart);
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
                        "function": __function,
                        principal: "apigateway.amazonaws.com",
                        action: "lambda:InvokeFunction"
                    });

                    methods.push(lambdaMethod);

                }

            }

            new agw.Deployment(restApi, methods);

        }



        //
        //
        //


        console.log(YAML.dump(stack.template));

        return stack;
    }


    uploadDeploymentFiles(stack: Stack) {
        console.log(`uploading to ${stack.deploymentBucket}`);
        var awsS3Client = new aws.S3();

        var s3Client = s3.createClient({ s3Client: awsS3Client });

        return send( () => awsS3Client.createBucket({
            Bucket: stack.deploymentBucket,
            CreateBucketConfiguration: {
                LocationConstraint: stack.region
            }
        }))
        .catch( () => console.log(`Bucket creation failed`) )
        .then( () => new Promise((resolve, reject) => {
            let progressBar = undefined;
            let lastAmount = 0;
            let uploader = s3Client.uploadDir({
                localDir: `${stack.project.deploymentDir}`,
                s3Params: {
                    Bucket: stack.deploymentBucket,
                    Prefix: `${stack.deploymentPrefix}/`,
                },
            })
            .on('progress', function() {
                if(uploader == undefined || uploader.progressTotal == 0)
                    return;

                if( progressBar === undefined )
                    progressBar = new ProgressBar('Syncing deployment bucket [:bar] :percent :etas', {
                            incomplete: chalk.grey('\u2588'),
                            complete: chalk.white('\u2588'),
                            total: uploader.progressTotal,
                            width: process.stdout['columns'] | 40,
                    });

                progressBar.tick(uploader.progressAmount - lastAmount);
                lastAmount = uploader.progressAmount;
            })
            .on('end', function() {
                resolve( stack )
            })
            .on('error', function(err) {
                reject( err );
            });
        }));
    }



    updateStack(stack) {

        let cf = new aws.CloudFormation({
            region: stack.region
        });

        // si existe, efectua un update, sino un create...


        return new Promise((resolve, reject) => {
            console.log('Stack exists??');

            send( () => cf.describeStacks({ StackName: stack.name }))
            .then((x) => resolve(true))
            .catch((x) => x.message.endsWith('does not exist')?
                resolve(false):
                reject(x))
        })

        // UPDATE / CREATE STACK

        .then((exists: any) => new Promise((resolve, reject) => {

            if( exists ) {
                var task = 'Updating stack';
                var method = 'updateStack';
                var successState = 'stackUpdateComplete';
            } else {
                var task = 'Creating stack';
                var method = 'createStack';
                var successState = 'stackCreateComplete';
            }

            console.log(task);

            send( () => cf[method]({
                StackName: stack.name,
                TemplateBody: JSON.stringify(stack.template),
                Capabilities: ['CAPABILITY_IAM', 'CAPABILITY_NAMED_IAM'],
                //OnFailure: this.debug? 'ROLLBACK': 'DELETE',
            }) )

            .then( () => {
                send( () => cf.waitFor(successState, {
                    StackName: stack.name
                }))
                .then( () => resolve() )
                .catch( (x) => reject(x) )
            })
            .catch( (xxx) => reject(xxx) );
        }))
    }

}
