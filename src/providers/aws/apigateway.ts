import {Stack, Resource, fn} from './cloudformation';
import {Function} from './lambda';
import {pascalCase} from 'change-case';

import {http} from '@ennube/runtime';
import * as _ from 'lodash';


export class RestApi extends Resource {
    constructor(stack: Stack, public gateway: http.Gateway) {
        super(stack);
    }
    allMethods: Method[] = [];

    get type() {
        return 'AWS::ApiGateway::RestApi';
    }
    get id() {
        return `Gateway${pascalCase(this.gateway.name)}`;
    }
    get properties() {
        return {
            Name: `${this.stack.project.name}-${this.gateway.name}`
        };
    }
}


export class Endpoint extends Resource {
    constructor(public restApi: RestApi, public parent: Endpoint, public urlPart: string) {
        super(restApi.stack);
    }
    get type() {
        return 'AWS::ApiGateway::Resource';
    }
    get id() {
        if(this.parent)
            return `${this.parent.id}SLASH${pascalCase(this.urlPart)}`;
        else
            return `${this.restApi.id}SLASH${pascalCase(this.urlPart)}`;
    }
    get properties() {
        return {
            RestApiId: this.restApi.ref,
            ParentId: this.parent !== undefined?
                this.parent.ref:
                this.restApi.getAtt('RootResourceId'),
            PathPart: this.urlPart
        };
    }
}


export interface MethodParams {
    httpMethod: string;
    urlParams: string[];
}

export abstract class Method extends Resource {
    httpMethod: string;
    urlParams: string[];

    constructor(public restApi: RestApi, public parent: Endpoint, params: MethodParams) {
        super(restApi.stack);
        Object.assign(this, params);
        restApi.allMethods.push(this);
    }
    get type() {
        return 'AWS::ApiGateway::Method';
    }
    get id() {
        if(this.parent)
            return `${this.parent.id}${this.httpMethod}`;
        else
            return `${this.restApi.id}${this.httpMethod}`;

    }
    get properties() {

        /*
            Delegar a Response Mapper / Request Mapper cuando el metodo requiera
            de integracion.
         */

        return {
            RestApiId: this.restApi.ref,
            ResourceId: this.parent !== undefined?
                this.parent.ref:
                this.restApi.getAtt('RootResourceId'),
            HttpMethod: this.httpMethod,
            AuthorizationType: 'NONE',
            RequestParameters: this.requestParameters,

            // La capa de integracion de un método...

            Integration: {
                Type: this.integrationType,
                Credentials: 'arn:aws:iam::597389418205:role/APIGatewayLambdaProxy',
//                IntegrationHttpMethod: this.httpMethod,
                IntegrationHttpMethod: 'POST',
//                IntegrationResponses: this.integrationResponses,
                Uri: this.integrationUri,
            },
//            MethodResponses: this.methodResponses,
        };
    }

    get requestParameters() {
        return _.fromPairs(this.urlParams.map( (param) =>
            [`method.request.path.${param}`, true]
        ));
    }

    abstract get integrationType();

    abstract get integrationUri();

}


export interface LambdaMethodParams extends MethodParams {
    function:Function;
    endpoint: http.Endpoint;
}


export class LambdaMethod extends Method {
    httpMethod: string;
    urlParams: string[];
    endpoint: http.Endpoint;
    function: Function;

    constructor(restApi: RestApi, parent: Endpoint, params: LambdaMethodParams) {
        super(restApi, parent, params);
        Object.assign(this, params);
    }

    get integrationType() {
        return 'AWS_PROXY';
    }

    get integrationUri() {
        return fn.join('', 'arn:aws:apigateway:', fn.ref('AWS::Region'),
            ':lambda:path/2015-03-31/functions/', this.function.getAtt('Arn'),
            '/invocations'
        );
    }

}

export interface DeploymentParams {
    variables?: {
        [varName:string]: string
    }
}


export class Deployment extends Resource {
    variables: {
        [varName:string]: string
    } = {};

    constructor(public restApi: RestApi, params: DeploymentParams = {}) {
        super(restApi.stack);
        Object.assign(this, params);
    }
    get dependsOn(){
        return this.restApi.allMethods;
    }
    get type() {
        return 'AWS::ApiGateway::Deployment';
    }
    get id() {
        return `${this.restApi.id}${pascalCase(this.stack.stage)}Deployment`;
    }
    get properties() {
        return {
            RestApiId: this.restApi.ref,
            StageName: `${pascalCase(this.stack.stage)}`,
            StageDescription: {
                Variables: this.variables
            }
        };
    }
}
