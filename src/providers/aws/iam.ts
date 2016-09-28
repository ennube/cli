import {ServiceDescriptor} from '@ennube/runtime';
import {pascalCase} from 'change-case';
import {Stack, Resource} from './cloudformation';

export interface RoleParams {
    name: string;
    path?: string;
    policyDocument?: any;
    managedPolicies?: string[];
}
/*
export function statement(){
    return {
        Effect: "Allow",
        Principal: {
            Service: ["lambda.amazonaws.com"]
        },
        Action: ["sts:AssumeRole"]
    };
}*/

export class Role extends Resource {
    name: string;
    path: string;
    policyDocument: any;
    managedPolicies: string[];
    constructor(stack: Stack, params: RoleParams) {
        super(stack);
        Object.assign(this, params);

    }
    get type() {
        return 'AWS::IAM::Role';
    }
    get id() {
        return `IAM${pascalCase(this.name)}Role`;
    }
    get properties() {
        return {
            RoleName: this.name,
            Path: this.path,
            ManagedPolicyArns: this.managedPolicies,
            AssumeRolePolicyDocument: this.policyDocument,
//            ManagedPolicyArns: [ String, ... ],
//            Policies: [ Policies, ... ],
        };
    }
}

export interface PolicyParams {
    policyDocument?: any;
    roles?: Role[];
}

export class Policy extends Resource {
    policyDocument: any = {};
    roles: Role[] = [];

    constructor(stack: Stack, public name: string, params: PolicyParams = {}) {
        super(stack);
        Object.assign(this, params);
    }
    get type() {
        return 'AWS::IAM::Policy';
    }
    get id() {
        return `IAM${pascalCase(this.name)}Policy`;
    }
    get properties() {
        return {
            PolicyName: this.name,
            PolicyDocument: this.policyDocument,
            Roles: this.roles.map( (role) => role.ref ),
            // USERS
            // GROUPS
        };
    }
}
