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
var project_1 = require('../../project');
var common_1 = require('./common');
var change_case_1 = require('change-case');
var fs = require('fs-extra');
var yaml = require('js-yaml');
var aws = require('aws-sdk');
var common_2 = require('./common');
var s3_1 = require('./s3');
var gateway_1 = require('./gateway');
var lambda_1 = require('./lambda');
var Amazon = (function () {
    function Amazon(project, stage) {
        if (stage === void 0) { stage = 'development'; }
        this.project = project;
        this.stage = stage;
        this.debug = true;
        this.region = 'eu-west-1';
        this.Metadata = {};
        this.Parameters = {};
        this.Mappings = {};
        this.Conditions = {};
        this.Resources = {};
        this.Outputs = {};
        this.prepared = false;
        this.deploymentBucketName = change_case_1.paramCase(project.name) + "-deployment";
        this.client = new aws['CloudFormation']({
            region: this.region
        });
        this.deployHash = (new Date()).toJSON();
    }
    Amazon.prototype.ensurePrepared = function () {
        if (this.prepared)
            return;
        this.project.ensureLoaded();
        this.Template = {
            AWSTemplateFormatVersion: "2010-09-09",
            Metadata: this.Metadata,
            Parameters: this.Parameters,
            Mappings: this.Mappings,
            Conditions: this.Conditions,
            Resources: this.Resources,
            Outputs: this.Outputs
        };
        this.prepareS3Template();
        this.prepareGatewayTemplate();
        this.prepareLambdaTemplate();
        this.prepareGatewayIntegrationTemplate();
        fs.writeFileSync(this.project.deploymentDir + "/stack.update.json", this.updateStackTemplate = JSON.stringify(this.Template));
        fs.writeFileSync(this.project.deploymentDir + "/stack.update.yaml", yaml.dump(this.Template));
        this.prepared = true;
    };
    Amazon.prototype.upload = function (args) {
        this.ensurePrepared();
        return this.uploadDeploymentFiles();
    };
    Amazon.prototype.validate = function (args) {
        this.ensurePrepared();
        this.send('validateTemplate', {
            TemplateBody: JSON.stringify(this.Template)
        })
            .then(function (x) { return console.log('OK'); })
            .catch(function (x) { return console.log('ER', x); });
    };
    Amazon.prototype.describe = function (args) {
        this.send('describeStacks', {})
            .then(function (x) { return console.log('OK', x); })
            .catch(function (x) { return console.log('ER', x); });
    };
    Amazon.prototype.ensure = function () {
        this.ensurePrepared();
        var stackName = common_1.getStackName(this.project.name, this.stage);
        return Promise.resolve();
    };
    Amazon.prototype.updateStack = function (shell) {
        var _this = this;
        this.ensurePrepared();
        var cf = this.client;
        var stackName = common_1.getStackName(this.project.name, this.stage);
        return Promise.resolve()
            .then(function () { return new Promise(function (resolve, reject) {
            console.log('Stack exists??');
            common_2.send(function () { return _this.client.describeStacks({
                StackName: stackName
            }); })
                .then(function (x) { return resolve(true); })
                .catch(function (x) { return x.message.endsWith('does not exist') ?
                resolve(false) :
                reject(x); });
        }); })
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
            shell.task(task);
            common_2.send(function () { return cf[method]({
                StackName: stackName,
                TemplateBody: _this.updateStackTemplate,
                Capabilities: ['CAPABILITY_IAM'],
            }); })
                .then(function () {
                common_2.send(function () { return _this.client.waitFor(successState, {
                    StackName: stackName
                }); })
                    .then(function () { return shell.resolveTask(resolve); })
                    .catch(function (x) { return shell.rejectTask(reject, x); });
            })
                .catch(function (x) { return shell.rejectTask(reject, x); });
        }); });
    };
    Amazon.prototype.send = function (method) {
        var _this = this;
        var params = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            params[_i - 1] = arguments[_i];
        }
        return new Promise(function (resolve, reject) {
            (_a = _this.client)[method].apply(_a, params)
                .on('success', function (response) { return resolve(response); })
                .on('error', function (response) { return reject(response); })
                .send();
            var _a;
        });
    };
    Amazon = __decorate([
        common_2.mixin(s3_1.S3, gateway_1.Gateway, lambda_1.Lambda), 
        __metadata('design:paramtypes', [project_1.Project, String])
    ], Amazon);
    return Amazon;
}());
exports.Amazon = Amazon;
//# sourceMappingURL=index.js.map