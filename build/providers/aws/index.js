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
var lambda = require('./lambda');
var iam = require('./iam');
var agw = require('./apigateway');
var YAML = require('js-yaml');
var _ = require('lodash');
var change_case_1 = require('change-case');
var aws = require('aws-sdk');
var s3 = require('s3');
var ProgressBar = require('progress');
var chalk = require('chalk');
function send(request) {
    return new Promise(function (resolve, reject) {
        request()
            .on('success', function (response) { return resolve(response); })
            .on('error', function (response) { return reject(response); })
            .send();
    });
}
var Aws = (function () {
    function Aws(shell) {
        this.shell = shell;
    }
    Aws.prototype.deploy = function (shell, project, builder) {
        var _this = this;
        return builder.build(shell, project)
            .then(function () { return _this.createStack(project); })
            .then(function (stack) { return _this.uploadDeploymentFiles(stack); })
            .then(function (stack) { return _this.updateStack(stack); });
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
        console.log(YAML.dump(stack.template));
        return stack;
    };
    Aws.prototype.uploadDeploymentFiles = function (stack) {
        console.log("uploading to " + stack.deploymentBucket);
        var awsS3Client = new aws.S3();
        var s3Client = s3.createClient({ s3Client: awsS3Client });
        return send(function () { return awsS3Client.createBucket({
            Bucket: stack.deploymentBucket,
            CreateBucketConfiguration: {
                LocationConstraint: stack.region
            }
        }); })
            .catch(function () { return console.log("Bucket creation failed"); })
            .then(function () { return new Promise(function (resolve, reject) {
            var progressBar = undefined;
            var lastAmount = 0;
            var uploader = s3Client.uploadDir({
                localDir: "" + stack.project.deploymentDir,
                s3Params: {
                    Bucket: stack.deploymentBucket,
                    Prefix: stack.deploymentPrefix + "/",
                },
            })
                .on('progress', function () {
                if (uploader == undefined || uploader.progressTotal == 0)
                    return;
                if (progressBar === undefined)
                    progressBar = new ProgressBar('Syncing deployment bucket [:bar] :percent :etas', {
                        incomplete: chalk.grey('\u2588'),
                        complete: chalk.white('\u2588'),
                        total: uploader.progressTotal,
                        width: process.stdout['columns'] | 40,
                    });
                progressBar.tick(uploader.progressAmount - lastAmount);
                lastAmount = uploader.progressAmount;
            })
                .on('end', function () {
                resolve(stack);
            })
                .on('error', function (err) {
                reject(err);
            });
        }); });
    };
    Aws.prototype.updateStack = function (stack) {
        var cf = new aws.CloudFormation({
            region: stack.region
        });
        return new Promise(function (resolve, reject) {
            console.log('Stack exists??');
            send(function () { return cf.describeStacks({ StackName: stack.name }); })
                .then(function (x) { return resolve(true); })
                .catch(function (x) { return x.message.endsWith('does not exist') ?
                resolve(false) :
                reject(x); });
        })
            .then(function (exists) { return new Promise(function (resolve, reject) {
            if (exists) {
                var task = 'Updating stack';
                var method = 'updateStack';
                var successState = 'stackUpdateComplete';
            }
            else {
                var task = 'Creating stack';
                var method = 'createStack';
                var successState = 'stackCreateComplete';
            }
            console.log(task);
            send(function () { return cf[method]({
                StackName: stack.name,
                TemplateBody: JSON.stringify(stack.template),
                Capabilities: ['CAPABILITY_IAM', 'CAPABILITY_NAMED_IAM'],
            }); })
                .then(function () {
                send(function () { return cf.waitFor(successState, {
                    StackName: stack.name
                }); })
                    .then(function () { return resolve(); })
                    .catch(function (x) { return reject(x); });
            })
                .catch(function (xxx) { return reject(xxx); });
        }); });
    };
    __decorate([
        shell_1.command('deploy'), 
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
        shell_1.manager(shell_1.Shell), 
        __metadata('design:paramtypes', [shell_1.Shell])
    ], Aws);
    return Aws;
}());
exports.Aws = Aws;
//# sourceMappingURL=index.js.map