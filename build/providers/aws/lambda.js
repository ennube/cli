"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var change_case_1 = require('change-case');
var cloudformation_1 = require('./cloudformation');
var Function = (function (_super) {
    __extends(Function, _super);
    function Function(stack, serviceDescriptor, role) {
        _super.call(this, stack);
        this.serviceDescriptor = serviceDescriptor;
        this.role = role;
    }
    Object.defineProperty(Function.prototype, "name", {
        get: function () {
            return this.serviceDescriptor.serviceClass.name;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Function.prototype, "type", {
        get: function () {
            return 'AWS::Lambda::Function';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Function.prototype, "id", {
        get: function () {
            return "" + this.name + change_case_1.pascalCase(this.stack.stage) + "Lambda";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Function.prototype, "properties", {
        get: function () {
            return {
                Description: "" + change_case_1.pascalCase(this.stack.stage) + this.name,
                Runtime: 'nodejs4.3',
                MemorySize: this.serviceDescriptor.memoryLimit,
                Timeout: this.serviceDescriptor.timeLimit,
                Handler: this.name + ".mainEntry",
                Role: this.role.getAtt('Arn'),
                Code: {
                    S3Bucket: this.stack.deploymentBucket,
                    S3Key: this.stack.deploymentPrefix + "/" + this.name + ".zip"
                },
            };
        },
        enumerable: true,
        configurable: true
    });
    return Function;
}(cloudformation_1.Resource));
exports.Function = Function;
var Permission = (function (_super) {
    __extends(Permission, _super);
    function Permission(stack, params) {
        _super.call(this, stack);
        Object.assign(this, params);
    }
    Object.defineProperty(Permission.prototype, "type", {
        get: function () {
            return 'AWS::Lambda::Permission';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Permission.prototype, "id", {
        get: function () {
            return "" + this.function.id + change_case_1.pascalCase(this.principal) + change_case_1.pascalCase(this.action) + "Permission";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Permission.prototype, "properties", {
        get: function () {
            return {
                FunctionName: this.function.getAtt('Arn'),
                Action: this.action,
                Principal: this.principal
            };
        },
        enumerable: true,
        configurable: true
    });
    return Permission;
}(cloudformation_1.Resource));
exports.Permission = Permission;
//# sourceMappingURL=lambda.js.map