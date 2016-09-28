import {ServiceDescriptor} from '@ennube/runtime';
import {pascalCase} from 'change-case';
import {Stack, Resource} from './cloudformation';
import * as iam from './iam';

export class Function extends Resource {
    constructor(stack: Stack, public serviceDescriptor: ServiceDescriptor, public role: iam.Role) {
        super(stack);
    }
    get name() {
        return this.serviceDescriptor.serviceClass.name;
    }
    get type() {
        return 'AWS::Lambda::Function';
    }
    get id() {
        return `${this.name}${pascalCase(this.stack.stage)}Lambda`;
    }
    get properties() {
        return {
            Description: `${pascalCase(this.stack.stage)}${this.name}`,
            Runtime: 'nodejs4.3',
            MemorySize: this.serviceDescriptor.memoryLimit,
            Timeout: this.serviceDescriptor.timeLimit,
            Handler: `${this.name}.mainEntry`,
            Role: this.role.getAtt('Arn'),
            Code: {
                //S3Bucket: ref(referencia a un bucket por parametro),
                S3Bucket: this.stack.deploymentBucket,
                S3Key: `${this.stack.deploymentPrefix}/${this.name}.zip`
            },

        };
    }
}

export interface PermissionParams {
    function: Function;
    principal: string;
    action: string;
}

export class Permission extends Resource {
    function: Function;
    principal: string;
    action: string;
    constructor(stack: Stack, params: PermissionParams) {
        super(stack);
        Object.assign(this, params);
    }
    get type() {
        return 'AWS::Lambda::Permission';
    }
    get id() {
        return `${this.function.id}${pascalCase(this.principal)}${pascalCase(this.action)}Permission`;
    }
    get properties() {
        return {
            FunctionName: this.function.getAtt('Arn'),
            Action: this.action,
            Principal: this.principal
        };
    }
}
