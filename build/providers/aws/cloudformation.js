"use strict";
var common_1 = require('./common');
var change_case_1 = require('change-case');
var _ = require('lodash');
var aws = require('aws-sdk');
var fn;
(function (fn) {
    function ref(id) {
        return { Ref: id };
    }
    fn.ref = ref;
    function getAtt(targetId, attr) {
        return { "Fn::GetAtt": [targetId, attr] };
    }
    fn.getAtt = getAtt;
    function join(delimitier) {
        var params = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            params[_i - 1] = arguments[_i];
        }
        return { "Fn::Join": [delimitier, params] };
    }
    fn.join = join;
})(fn = exports.fn || (exports.fn = {}));
var Stack = (function () {
    /*
        resources: {
            [typeName:string]: Resource[]
        } = { };
    */
    function Stack(project, params) {
        this.project = project;
        this.region = 'eu-west-1';
        this.stage = 'development';
        this.resourceList = [];
        this.capabilities = ['CAPABILITY_IAM', 'CAPABILITY_NAMED_IAM'];
        Object.assign(this, params);
    }
    Object.defineProperty(Stack.prototype, "name", {
        get: function () {
            return change_case_1.pascalCase(this.project.name) + "-" + change_case_1.pascalCase(this.stage);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Stack.prototype, "template", {
        get: function () {
            return {
                AWSTemplateFormatVersion: "2010-09-09",
                Metadata: {},
                Parameters: {},
                Mappings: {},
                Conditions: {},
                Resources: _.fromPairs(this.resourceList.map(function (r) { return [r.id, {
                        Type: r.type,
                        Properties: r.properties,
                        DependsOn: r.dependsOn ? r.dependsOn.map(function (r) { return r.id; }) : undefined,
                        Metadata: r.metadata
                    }]; })),
                Outputs: {}
            };
        },
        enumerable: true,
        configurable: true
    });
    Stack.prototype.add = function (item) {
        this.resourceList.push(item);
    };
    Stack.prototype.update = function (onFailure) {
        var _this = this;
        if (onFailure === void 0) { onFailure = 'ROLLBACK'; }
        var cf = new aws.CloudFormation({ region: this.region });
        return new Promise(function (resolve, reject) {
            common_1.send(function () { return cf.describeStacks({ StackName: _this.name }); })
                .then(function (x) { return resolve(true); })
                .catch(function (x) { return x.message.endsWith('does not exist') ?
                resolve(false) :
                reject(x); });
        })
            .then(function (exists) { return exists ? {
            name: 'Updating stack',
            method: 'updateStack',
            successState: 'stackUpdateComplete'
        } : {
            name: 'Creating stack',
            method: 'createStack',
            successState: 'stackCreateComplete'
        }; })
            .then(function (task) {
            console.log(task.name);
            return task;
        })
            .then(function (task) {
            return common_1.send(function () { return cf[task.method]({
                StackName: _this.name,
                TemplateBody: JSON.stringify(_this.template),
                Capabilities: _this.capabilities,
            }); })
                .then(function () { return task; });
        })
            .then(function (task) { return common_1.send(function () {
            return cf.waitFor(task.successState, {
                StackName: _this.name
            });
        }); });
        //.then( () => resolve() )
        //.catch( (x) => reject(x) )
        //return this;
    };
    return Stack;
}());
exports.Stack = Stack;
var Resource = (function () {
    function Resource(stack) {
        this.stack = stack;
        stack.add(this);
    }
    Object.defineProperty(Resource.prototype, "id", {
        get: function () { },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Resource.prototype, "type", {
        get: function () { },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Resource.prototype, "properties", {
        get: function () { },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Resource.prototype, "ref", {
        get: function () {
            return { 'Ref': this.id };
        },
        enumerable: true,
        configurable: true
    });
    Resource.prototype.getAtt = function (att) {
        return { 'Fn::GetAtt': [this.id, att] };
    };
    return Resource;
}());
exports.Resource = Resource;
//# sourceMappingURL=cloudformation.js.map