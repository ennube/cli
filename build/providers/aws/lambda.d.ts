/// <reference types="core-js" />
import { ServiceDescriptor } from '@ennube/runtime';
import * as cf from './cloudformation';
import * as iam from './iam';
export declare class Function extends cf.Resource {
    serviceDescriptor: ServiceDescriptor;
    role: iam.Role;
    constructor(stack: cf.Stack, serviceDescriptor: ServiceDescriptor, role: iam.Role);
    readonly name: string;
    readonly type: string;
    readonly id: string;
    readonly properties: {
        Description: string;
        Runtime: string;
        MemorySize: Number;
        Timeout: Number;
        Handler: string;
        Role: {
            'Fn::GetAtt': string[];
        };
        Code: {
            S3Bucket: string;
            S3Key: string;
        };
    };
}
export interface PermissionParams {
    function: Function;
    principal: string;
    action: string;
}
export declare class Permission extends cf.Resource {
    function: Function;
    principal: string;
    action: string;
    constructor(stack: cf.Stack, params: PermissionParams);
    readonly type: string;
    readonly id: string;
    readonly properties: {
        FunctionName: {
            'Fn::GetAtt': string[];
        };
        Action: string;
        Principal: string;
    };
}
