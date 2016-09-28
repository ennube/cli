import { ServiceDescriptor } from '@ennube/runtime';
import { Stack, Resource } from './cloudformation';
import * as iam from './iam';
export declare class Function extends Resource {
    serviceDescriptor: ServiceDescriptor;
    role: iam.Role;
    constructor(stack: Stack, serviceDescriptor: ServiceDescriptor, role: iam.Role);
    readonly name: string;
    readonly type: string;
    readonly id: string;
    readonly properties: {
        Description: string;
        Runtime: string;
        MemorySize: number;
        Timeout: number;
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
export declare class Permission extends Resource {
    function: Function;
    principal: string;
    action: string;
    constructor(stack: Stack, params: PermissionParams);
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
