import {Project, Shell} from '../../classes';
import {http} from '@ennube/sdk';

import {pascalCase} from 'change-case';
import * as _ from 'lodash';
import * as yaml from 'js-yaml';
import * as aws from 'aws-sdk';


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
        project.loadMainModule();
        this.buildGateway()


    }

    buildGateway() {

        gatewayIterator((gateway, url, method, endpoint) => {
            this.ensureGateway(gateway);
            let urlId = this.ensureGatewayUrl(gateway, url);
            this.createGatewayUrlMethod(gateway, urlId, method, '<lambda id>');

            // configura el metodo con lambda...
        });

        console.log(yaml.dump(this.Template));
    }

    ensureGateway(gateway) {
        let id = gatewayId(gateway);
        if( id in this.Resources)
            return;
        this.Resources[id] = {
            Type: 'AWS::ApiGateway::RestApi',
            Properties: {
                Name: pascalCase(gateway)
            }
        }
    }

    ensureGatewayUrl(gateway:string, url:string) {
        url = _.trim(url, '/');
        if(!url.length)
            return;

        let parts = [];
        let prevId;
        for(let urlPart of url.split('/')) {
            parts.push(urlPart)
            let id = gatewayUrlId(gateway, parts);
            if( id in this.Resources )
                continue;

            this.Resources[id] = {
                Type: 'AWS::ApiGateway::Resource',
                Properties: {
                    RestApiId: ref(gatewayId(gateway)),
                    ParentId: prevId? ref(prevId):
                        getAtt(gatewayId(gateway), 'RootResourceId'),
                    PathPart: urlPart
                }
            }
            prevId = id;
        }
        return prevId;
    }

    createGatewayUrlMethod(gateway, resourceId:string, method:string, lambdaId:string) {
        // Si no se han generado lambdas, no genera la integracion
        // la creacion del stack, sirve para crear los buckets
        // despues subir los datos, y luego el update..
        let id = resourceId + method.toUpperCase();
        this.Resources[id] = {
            Type: 'AWS::ApiGateway::Method',
            Properties: {
                RestApiId: ref(gatewayId(gateway)),
                ResourceID: resourceId? ref(resourceId):
                    getAtt(gatewayId(gateway), 'RootResourceId'),
                HttpMethod: method.toLowerCase(),
                RequestParameters: {},
                Integration: {},
            }
        }
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
        let stage: 'dev'; // from args

        this.send('createStack', {
            StackName: stackName(this.project.npm.name, stage),
            TemplateBody: JSON.stringify(this.Template),
            //Capabilities: 'CAPABILITY_NAMED_IAM',
            OnFailure: 'DELETE',
            // Stage on parameters
            //

        })
        .then((x) => console.log('OK'))
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
function stackName(projectName: string, stage: string) {
    return `${pascalCase(projectName)}-${pascalCase(stage)}`;
}

function ref(id:string) {
    return { Ref: id };
}

function getAtt(id:string, attr:string){
    return { "Fn::GetAtt": [id, attr] };
}

function gatewayId(gateway:string) {
    return `Gateway${pascalCase(gateway)}`;
}

function gatewayUrlId(gateway:string, parts:string[]) {
    return gatewayId(gateway) + `URL` +
        parts.map( (v) => pascalCase(_.trim(v, '{}')) ).join('SLASH') ;
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
