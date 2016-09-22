/// <reference types="lodash" />
import { Stack, Resource } from './cloudformation';
import { Function } from './lambda';
import { http } from '@ennube/runtime';
import * as _ from 'lodash';
export declare class RestApi extends Resource {
    gateway: http.Gateway;
    constructor(stack: Stack, gateway: http.Gateway);
    allMethods: Method[];
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
            Credentials: string;
            IntegrationHttpMethod: string;
            Uri: any;
        };
    };
    readonly requestParameters: _.Dictionary<any>;
    readonly abstract integrationType: any;
    readonly abstract integrationUri: any;
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
export interface DeploymentParams {
    variables?: {
        [varName: string]: string;
    };
}
export declare class Deployment extends Resource {
    restApi: RestApi;
    variables: {
        [varName: string]: string;
    };
    constructor(restApi: RestApi, params?: DeploymentParams);
    readonly dependsOn: Method[];
    readonly type: string;
    readonly id: string;
    readonly properties: {
        RestApiId: any;
        StageName: string;
        StageDescription: {
            Variables: {
                [varName: string]: string;
            };
        };
    };
}
