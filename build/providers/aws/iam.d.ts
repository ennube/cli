import { Stack, Resource } from './cloudformation';
export interface RoleParams {
    name: string;
    path?: string;
    policyDocument?: any;
    managedPolicies?: string[];
}
export declare class Role extends Resource {
    name: string;
    path: string;
    policyDocument: any;
    managedPolicies: string[];
    constructor(stack: Stack, params: RoleParams);
    readonly type: string;
    readonly id: string;
    readonly properties: {
        RoleName: string;
        Path: string;
        ManagedPolicyArns: string[];
        AssumeRolePolicyDocument: any;
    };
}
export interface PolicyParams {
    policyDocument?: any;
    roles?: Role[];
}
export declare class Policy extends Resource {
    name: string;
    policyDocument: any;
    roles: Role[];
    constructor(stack: Stack, name: string, params?: PolicyParams);
    readonly type: string;
    readonly id: string;
    readonly properties: {
        PolicyName: string;
        PolicyDocument: any;
        Roles: any[];
    };
}
