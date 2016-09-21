import * as cf from './cloudformation';
export interface RoleParams {
    name: string;
    path?: string;
    policyDocument?: any;
}
export declare class Role extends cf.Resource {
    name: string;
    path: string;
    policyDocument: any;
    constructor(stack: cf.Stack, params: RoleParams);
    readonly type: string;
    readonly id: string;
    readonly properties: {
        RoleName: string;
        Path: string;
        AssumeRolePolicyDocument: any;
    };
}
export interface PolicyParams {
    policyDocument?: any;
    roles?: Role[];
}
export declare class Policy extends cf.Resource {
    name: string;
    policyDocument: any;
    roles: Role[];
    constructor(stack: cf.Stack, name: string, params?: PolicyParams);
    readonly type: string;
    readonly id: string;
    readonly properties: {
        PolicyName: string;
        PolicyDocument: any;
        Roles: any[];
    };
}
