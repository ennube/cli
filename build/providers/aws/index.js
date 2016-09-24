"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var shell_1 = require('../../shell');
var project_1 = require('../../project');
var builder_1 = require('../../builder');
var rt = require('@ennube/runtime');
var cloudformation_1 = require('./cloudformation');
var s3 = require('./s3');
var lambda = require('./lambda');
var iam = require('./iam');
var agw = require('./apigateway');
var _ = require('lodash');
var change_case_1 = require('change-case');
var Aws = (function () {
    function Aws(shell, project) {
        this.shell = shell;
        this.project = project;
    }
    Aws.prototype.deploy = function (shell, project, builder) {
        var _this = this;
        return builder.build()
            .then(function () { return _this.createStack(project); })
            .then(function (stack) {
            return s3.listBuckets()
                .then(function (existent) {
                return s3.syncBucket({
                    sourceDirectory: stack.project.deploymentDir,
                    defaultRegion: stack.region,
                    bucketName: stack.deploymentBucket,
                    destinationDirectory: stack.deploymentPrefix,
                    createFirst: !(stack.deploymentBucket in existent)
                });
            })
                .then(function () { return stack; });
        })
            .then(function (stack) { return stack.update(); });
    };
    Aws.prototype.createStack = function (project) {
        project.ensureLoaded();
        var stack = new cloudformation_1.Stack(project, {
            deploymentBucket: change_case_1.paramCase(project.name) + "-deployment",
            deploymentPrefix: "" + (new Date()).toJSON(),
        });
        var lambdas = {};
        var lambdaRoles = [];
        for (var serviceName in rt.allServiceDescriptors) {
            var serviceDescriptor = rt.allServiceDescriptors[serviceName];
            var role = new iam.Role(stack, {
                name: serviceName + "Execution",
                policyDocument: {
                    Version: "2012-10-17",
                    Statement: [{
                            Effect: "Allow",
                            Principal: {
                                Service: ["lambda.amazonaws.com"]
                            },
                            Action: ["sts:AssumeRole"]
                        }]
                }
            });
            lambdas[serviceName] = new lambda.Function(stack, serviceDescriptor, role);
            lambdaRoles.push(role);
        }
        if (lambdaRoles.length)
            new iam.Policy(stack, 'LambdaLogger', {
                roles: lambdaRoles,
                policyDocument: {
                    Version: '2012-10-17',
                    Statement: [{
                            Effect: "Allow",
                            Action: [
                                "logs:CreateLogGroup",
                                "logs:CreateLogStream",
                                "logs:PutLogEvents"
                            ],
                            Resource: "arn:aws:logs:" + stack.region + ":*:*"
                        }]
                }
            });
        var apiGatewayRoles = [];
        for (var gatewayName in rt.http.allGateways) {
            var gateway = rt.http.allGateways[gatewayName];
            var restApi = new agw.RestApi(stack, gateway);
            var role = new iam.Role(stack, {
                name: gatewayName + "Execution",
                policyDocument: {
                    Version: "2012-10-17",
                    Statement: [{
                            Effect: "Allow",
                            Principal: {
                                Service: ["lambda.amazonaws.com"]
                            },
                            Action: ["sts:AssumeRole"]
                        }]
                },
            });
            apiGatewayRoles.push(role);
            var endpoints = {};
            for (var url in gateway.endpoints) {
                var httpMethods = gateway.endpoints[url];
                var requestParameters = {};
                var parentEndpoint = void 0;
                var urlParams = [];
                var urlParts = [];
                url = _.trim(url, '/');
                if (!!url)
                    for (var _i = 0, _a = url.split('/'); _i < _a.length; _i++) {
                        var urlPart = _a[_i];
                        urlParts.push(urlPart);
                        var endpointUrl = urlParts.join('/');
                        var paramMatch = /\{([\-\w]+)(\+)?\}/.exec(urlPart);
                        if (paramMatch)
                            urlParams.push(paramMatch[1]);
                        parentEndpoint = endpoints[endpointUrl];
                        if (parentEndpoint === undefined)
                            parentEndpoint = endpoints[endpointUrl] =
                                new agw.Endpoint(restApi, parentEndpoint, urlPart);
                    }
                for (var httpMethod in httpMethods) {
                    var endpoint = httpMethods[httpMethod];
                    var __function = lambdas[endpoint.serviceDescriptor.serviceClass.name];
                    var lambdaMethod = new agw.LambdaMethod(restApi, parentEndpoint, {
                        "function": __function,
                        endpoint: endpoint,
                        urlParams: urlParams,
                        httpMethod: httpMethod
                    });
                    new lambda.Permission(stack, {
                        'function': __function,
                        principal: 'apigateway.amazonaws.com',
                        action: 'lambda:InvokeFunction',
                    });
                }
            }
            new agw.Deployment(restApi, {
                variables: {
                    gatewayName: gatewayName
                }
            });
        }
        if (apiGatewayRoles.length)
            new iam.Policy(stack, 'LambdaInvokeFunction', {
                roles: apiGatewayRoles,
                policyDocument: {
                    "Version": "2012-10-17",
                    "Statement": [
                        {
                            "Effect": "Allow",
                            "Action": "lambda:InvokeFunction",
                            "Resource": "*"
                        }
                    ]
                }
            });
        return Promise.resolve(stack);
    };
    __decorate([
        shell_1.command('deploy', 'build, pack, synchronizes and deploy the project'), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [shell_1.Shell, project_1.Project, builder_1.Builder]), 
        __metadata('design:returntype', void 0)
    ], Aws.prototype, "deploy", null);
    __decorate([
        shell_1.command('stack'), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [project_1.Project]), 
        __metadata('design:returntype', void 0)
    ], Aws.prototype, "createStack", null);
    Aws = __decorate([
        shell_1.manager(shell_1.Shell, project_1.Project), 
        __metadata('design:paramtypes', [shell_1.Shell, project_1.Project])
    ], Aws);
    return Aws;
}());
exports.Aws = Aws;
//# sourceMappingURL=index.js.map