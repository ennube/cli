/// <reference types="lodash" />
import { Stack, Resource } from './cloudformation';
import { Function } from './lambda';
import { http } from '@ennube/runtime';
import * as _ from 'lodash';
export declare class RestApi extends Resource {
    gateway: http.Gateway;
    constructor(stack: Stack, gateway: http.Gateway);
    readonly type: string;
    readonly id: string;
    readonly properties: {
        Name: string;
    };
}
export declare class Endpoint extends Resource {
    restApi: RestApi;
    parent: Endpoint;
    urlPart: string;
    constructor(restApi: RestApi, parent: Endpoint, urlPart: string);
    readonly type: string;
    readonly id: any;
    readonly properties: {
        RestApiId: any;
        ParentId: any;
        PathPart: string;
    };
}
export interface MethodParams {
    httpMethod: string;
    urlParams: string[];
}
export declare abstract class Method extends Resource {
    restApi: RestApi;
    parent: Endpoint;
    httpMethod: string;
    urlParams: string[];
    constructor(restApi: RestApi, parent: Endpoint, params: MethodParams);
    readonly type: string;
    readonly id: string;
    readonly properties: {
        RestApiId: any;
        ResourceId: any;
        HttpMethod: string;
        AuthorizationType: string;
        RequestParameters: _.Dictionary<any>;
        Integration: {
            Type: any;
            IntegrationHttpMethod: string;
            IntegrationResponses: any;
            Uri: any;
        };
        MethodResponses: any;
    };
    readonly requestParameters: _.Dictionary<any>;
    readonly abstract integrationType: any;
    readonly abstract integrationUri: any;
    readonly integrationResponses: any;
    readonly methodResponses: any;
}
export interface LambdaMethodParams extends MethodParams {
    function: Function;
    endpoint: http.Endpoint;
}
export declare class LambdaMethod extends Method {
    httpMethod: string;
    urlParams: string[];
    endpoint: http.Endpoint;
    function: Function;
    constructor(restApi: RestApi, parent: Endpoint, params: LambdaMethodParams);
    readonly integrationType: string;
    readonly integrationUri: {
        "Fn::Join": (string | any[])[];
    };
}
export declare class Deployment extends Resource {
    restApi: RestApi;
    dependsOn: Resource[];
    constructor(restApi: RestApi, dependsOn: Resource[]);
    readonly type: string;
    readonly id: string;
    readonly properties: {
        RestApiId: any;
        StageName: string;
    };
}
