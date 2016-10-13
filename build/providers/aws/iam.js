"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var change_case_1 = require('change-case');
var cloudformation_1 = require('./cloudformation');
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
var Role = (function (_super) {
    __extends(Role, _super);
    function Role(stack, params) {
        _super.call(this, stack);
        Object.assign(this, params);
    }
    Object.defineProperty(Role.prototype, "type", {
        get: function () {
            return 'AWS::IAM::Role';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Role.prototype, "id", {
        get: function () {
            return "IAM" + change_case_1.pascalCase(this.name) + "Role";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Role.prototype, "properties", {
        get: function () {
            return {
                RoleName: this.name,
                Path: this.path,
                ManagedPolicyArns: this.managedPolicies,
                AssumeRolePolicyDocument: this.policyDocument,
            };
        },
        enumerable: true,
        configurable: true
    });
    return Role;
}(cloudformation_1.Resource));
exports.Role = Role;
var Policy = (function (_super) {
    __extends(Policy, _super);
    function Policy(stack, name, params) {
        if (params === void 0) { params = {}; }
        _super.call(this, stack);
        this.name = name;
        this.policyDocument = {};
        this.roles = [];
        Object.assign(this, params);
    }
    Object.defineProperty(Policy.prototype, "type", {
        get: function () {
            return 'AWS::IAM::Policy';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Policy.prototype, "id", {
        get: function () {
            return "IAM" + change_case_1.pascalCase(this.name) + "Policy";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Policy.prototype, "properties", {
        get: function () {
            return {
                PolicyName: this.name,
                PolicyDocument: this.policyDocument,
                Roles: this.roles.map(function (role) { return role.ref; }),
            };
        },
        enumerable: true,
        configurable: true
    });
    return Policy;
}(cloudformation_1.Resource));
exports.Policy = Policy;
//# sourceMappingURL=iam.js.map