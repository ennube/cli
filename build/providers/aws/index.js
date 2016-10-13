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
//import * as YAML from 'js-yaml';
var _ = require('lodash');
var yaml = require('js-yaml');
var fs = require('fs-extra');
var change_case_1 = require('change-case');
var AWS = (function () {
    function AWS(shell, project) {
        this.shell = shell;
        this.project = project;
    }
    AWS.prototype.deploy = function (shell, project, builder) {
        var _this = this;
        var stack;
        var existingBuckets;
        var promise = builder.build()
            .then(function () { return stack = _this.createStack(project); })
            .then(function () { return fs.writeFileSync(project.buildDir + "/stack.yml", yaml.dump(stack.template)); })
            .then(function (stack) { return s3.listBuckets(); })
            .then(function (result) { return existingBuckets = result; })
            .then(function () {
            return s3.syncBucket({
                sourceDirectory: stack.project.deploymentDir,
                createBucket: !(stack.deploymentBucket in existingBuckets),
                defaultRegion: stack.region,
                bucketName: stack.deploymentBucket,
                destinationDirectory: stack.deploymentPrefix,
            });
        })
            .then(console.log.bind(console))
            .then(function () { return stack.update(); });
        //.then( () => stack.template)
        // now syncs the static files...
        return promise;
    };
    AWS.prototype.createStack = function (project) {
        project.ensureLoaded();
        var stage = 'development';
        var stack = new cloudformation_1.Stack(project, {
            stage: stage,
            //          region: ...,
            deploymentBucket: change_case_1.paramCase(project.name) + "-deployment",
            deploymentPrefix: (new Date()).toJSON() + "-" + stage,
        });
        // Create lambda resources.
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
                },
                managedPolicies: [
                    //                    'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole',
                    'arn:aws:iam::aws:policy/AWSLambdaExecute',
                ].concat(serviceDescriptor.managedPolicies)
            });
            lambdas[serviceName] = new lambda.Function(stack, serviceDescriptor, role);
            lambdaRoles.push(role);
        }
        /*
                if(lambdaRoles.length)
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
                                Resource: `arn:aws:logs:${stack.region}:*:*`
                            }]
                        }
                    });
        */
        //
        //   API GATEWAY
        //
        var apiGatewayRoles = [];
        for (var gatewayName in rt.http.allGateways) {
            var gateway = rt.http.allGateways[gatewayName];
            var restApi = new agw.RestApi(stack, gateway);
            var role = new iam.Role(stack, {
                name: "" + change_case_1.pascalCase(project.name) + change_case_1.pascalCase(gatewayName) + "Gateway",
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
                managedPolicies: [
                    'arn:aws:iam::aws:policy/service-role/AWSLambdaRole'
                ]
            });
            apiGatewayRoles.push(role);
            var endpoints = {};
            for (var url in gateway.endpoints) {
                var httpMethods = gateway.endpoints[url];
                var requestParameters = {};
                var parentEndpointUrl = void 0;
                var parentEndpoint = void 0;
                var urlParams = [];
                var urlParts = [];
                url = _.trim(url, '/');
                if (!!url)
                    for (var _i = 0, _a = url.split('/'); _i < _a.length; _i++) {
                        var urlPart = _a[_i];
                        var paramMatch = /\{([\-\w]+)(\+)?\}/.exec(urlPart);
                        if (paramMatch)
                            urlParams.push(paramMatch[1]);
                        urlParts.push(urlPart);
                        var endpointUrl = urlParts.join('/');
                        var endpoint = endpoints[endpointUrl];
                        if (endpoint === undefined)
                            endpoint = endpoints[endpointUrl] =
                                new agw.Endpoint(restApi, parentEndpoint, urlPart);
                        parentEndpointUrl = endpointUrl;
                        parentEndpoint = endpoint;
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
        /*
                if(apiGatewayRoles.length)
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
        */
        return stack;
    };
    __decorate([
        shell_1.command('deploy', 'build, pack, synchronizes and deploy the project'), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [shell_1.Shell, project_1.Project, builder_1.Builder]), 
        __metadata('design:returntype', void 0)
    ], AWS.prototype, "deploy", null);
    __decorate([
        shell_1.command('stack'), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [project_1.Project]), 
        __metadata('design:returntype', void 0)
    ], AWS.prototype, "createStack", null);
    AWS = __decorate([
        shell_1.manager(shell_1.Shell, project_1.Project), 
        __metadata('design:paramtypes', [shell_1.Shell, project_1.Project])
    ], AWS);
    return AWS;
}());
exports.AWS = AWS;
//# sourceMappingURL=index.js.map