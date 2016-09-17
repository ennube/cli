import {Project, Shell} from '../../classes';
import {http} from '@ennube/runtime';

import {pascalCase} from 'change-case';
import * as _ from 'lodash';
import * as fs from 'fs-extra';
import * as yaml from 'js-yaml';
import * as aws from 'aws-sdk';

const httpResponsecodes = {
    200: 'Found',
};

export class Amazon {//} extends Provider {

    client : any;

    Template: Object;
    Metadata: Object = {};
    Parameters: Object = {};
    Mappings: Object = {};
    Conditions: Object = {};
    Resources: Object = {};
    Outputs: Object = {};

    constructor(public project:Project) {
        project.ensureLoaded();

        this.client = new aws['CloudFormation']({
            region: 'us-east-1'
        });

        this.Template = {
           AWSTemplateFormatVersion: "2010-09-09",
           Metadata: this.Metadata,
           Parameters: this.Parameters,
           Mappings: this.Mappings,
           Conditions: this.Conditions,
           Resources: this.Resources,
           Outputs: this.Outputs
        };

        this.buildGateway()


    }

    buildGateway() {
        gatewayIterator((gateway, url, method, endpoint) => {
            url = _.trim(url, '/');

            // Ensure gateway
            let gatewayId = getGatewayId(gateway);
            if( !(gatewayId in this.Resources) )
                this.Resources[gatewayId] = {
                    Type: 'AWS::ApiGateway::RestApi',
                    Properties: {
                        Name: `${this.project.npm.name}-${gateway}`
                    }
                }
            // Ensure URL RESOURCE
            let urlParts = [];
            let urlArgs = [];
            let parentResourceId;

            if(!!url)
            for(let urlPart of url.split('/')) {
/*
                let argMatch = /\{([\-\w]+)\}/.exec(urlPart);
                if( argMatch ) {
                    urlPart = `{ARG${urlArgs.length}}`;
                    urlArgs.push(argMatch[1]);
                }
*/
                urlParts.push(urlPart)
                let resourceId = getGatewayUrlId(gateway, urlParts);

                if( !(resourceId in this.Resources) )
                    this.Resources[resourceId] = {
                        Type: 'AWS::ApiGateway::Resource',
                        Properties: {
                            RestApiId: ref(gatewayId),
                            ParentId: parentResourceId?
                                ref(parentResourceId):
                                getAtt(gatewayId, 'RootResourceId'),
                            PathPart: urlPart
                        }
                    }
                parentResourceId = resourceId;
            }

            // CREATE METHOD
            let methodId = getGatewayUrlMethodId(gateway, urlParts, method);

            this.Resources[methodId] = {
                Type: 'AWS::ApiGateway::Method',
                Properties: {
                    RestApiId: ref(gatewayId),
                    ResourceId: parentResourceId?
                        ref(parentResourceId):
                        getAtt(gatewayId, 'RootResourceId'),
                    HttpMethod: method.toUpperCase(),
                    AuthorizationType: 'NONE',
    //                AuthorizerId:
                    RequestParameters: {},
                    Integration: {
                        Type: 'MOCK',
                        IntegrationHttpMethod: method.toUpperCase(),
                    },
                }
            }

        });
        fs.writeFileSync('template.yaml', yaml.dump(this.Template));
    }


    @Shell.command('validate')
    validate(args) {
        this.send('validateTemplate', {
            TemplateBody: JSON.stringify(this.Template)
        })
        .then((x) => console.log('OK'))
        .catch((x) => console.log('ER', x));
    }

    @Shell.command('create')
    create(args) {
        let stage = 'dev'; // from args

        this.send('createStack', {
            StackName: getStackName(this.project.npm.name, stage),
            TemplateBody: JSON.stringify(this.Template),
            //Capabilities: 'CAPABILITY_NAMED_IAM',
            //OnFailure: 'DELETE',
            // Stage on parameters
            //

        })
        .then((x) => console.log('OK', x))
        .catch((x) => console.log('ER', x));
    }


    send(method:string, params:Object) {
        return new Promise((resolve, reject) => {
            this.client[method](params)
            .on('success', (response) => resolve(response) )
            .on('error', (response) => reject(response) )
            .send();
        });
    }

}
function getStackName(projectName: string, stage: string) {
    return `${pascalCase(projectName)}-${pascalCase(stage)}`;
}

function ref(id:string) {
    return { Ref: id };
}

function getAtt(id:string, attr:string){
    return { "Fn::GetAtt": [id, attr] };
}

function getGatewayId(gateway:string) {
    return `Gateway${pascalCase(gateway)}`;
}

function getGatewayUrlId(gateway:string, parts:string[]) {
    return getGatewayId(gateway) + `URL` +
        parts.map( (v) => pascalCase(_.trim(v, '{}')) ).join('SLASH') ;
}

function getGatewayUrlMethodId(gateway:string, parts:string[], method: string) {
    return getGatewayUrlId(gateway, parts) + method.toUpperCase();
}


type GatewayIteratorCB = (gateway:string, method:string, url: string, endpoint: http.Endpoint) => void;

function gatewayIterator( callback: GatewayIteratorCB ) {
    for( let gatewayId in http.allGateways ) {
        let gateway = http.allGateways[gatewayId];
        for( let url in gateway.endpoints ) {
            let urlMethods = gateway.endpoints[url];
            for( let method in urlMethods )
                callback(gatewayId, url, method, urlMethods[method]);
        }
    }
}
