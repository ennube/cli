"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var classes_1 = require('../../classes');
var common_1 = require('./common');
var fs = require('fs-extra');
var yaml = require('js-yaml');
var aws = require('aws-sdk');
var common_2 = require('./common');
var s3_1 = require('./s3');
var gateway_1 = require('./gateway');
var lambda_1 = require('./lambda');
var Amazon = (function (_super) {
    __extends(Amazon, _super);
    function Amazon(project, stage) {
        if (stage === void 0) { stage = 'development'; }
        _super.call(this, project);
        this.project = project;
        this.stage = stage;
        this.debug = true;
        this.region = 'us-east-1';
        this.Metadata = {};
        this.Parameters = {};
        this.Mappings = {};
        this.Conditions = {};
        this.Resources = {};
        this.Outputs = {};
        this.prepared = false;
        this.client = new aws['CloudFormation']({
            region: this.region
        });
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
        fs.writeFileSync(this.project.deploymentDir + "/stack.create.json", this.createStackTemplate = JSON.stringify(this.Template));
        fs.writeFileSync(this.project.deploymentDir + "/stack.create.yaml", yaml.dump(this.Template));
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
        var _this = this;
        this.ensurePrepared();
        var stackName = common_1.getStackName(this.project.name, this.stage);
        return Promise.resolve()
            .then(function () { return new Promise(function (resolve, reject) {
            console.log('Esuring stack existance...');
            _this.send('describeStacks', {
                StackName: stackName
            })
                .then(function (x) { return resolve(true); })
                .catch(function (x) { return x.message.endsWith('does not exist') ?
                resolve(false) :
                reject(x); });
        }); })
            .then(function (exists) { return exists || new Promise(function (resolve, reject) {
            console.log('Creating stack...');
            _this.send('createStack', {
                StackName: stackName,
                TemplateBody: _this.createStackTemplate,
                Capabilities: ['CAPABILITY_IAM'],
            })
                .then(function () { return resolve(_this.send('waitFor', 'stackCreateComplete', {
                StackName: stackName,
            })); })
                .catch(function (x) { return reject(x); });
        }); });
    };
    Amazon.prototype.update = function () {
        var _this = this;
        this.ensurePrepared();
        var stackName = common_1.getStackName(this.project.name, this.stage);
        return Promise.resolve()
            .then(function () { return new Promise(function (resolve, reject) {
            console.log('Updating stack...');
            _this.send('updateStack', {
                StackName: stackName,
                TemplateBody: _this.updateStackTemplate,
                Capabilities: ['CAPABILITY_IAM'],
            })
                .then(function () { return resolve(_this.send('waitFor', 'stackUpdateComplete', {
                StackName: stackName,
            })); })
                .catch(function (x) { return reject(x); });
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
    __decorate([
        classes_1.command('upload')
    ], Amazon.prototype, "upload", null);
    __decorate([
        classes_1.command('validate')
    ], Amazon.prototype, "validate", null);
    __decorate([
        classes_1.command('describe')
    ], Amazon.prototype, "describe", null);
    __decorate([
        classes_1.command('ensures the stack exists')
    ], Amazon.prototype, "ensure", null);
    __decorate([
        classes_1.command()
    ], Amazon.prototype, "update", null);
    Amazon = __decorate([
        common_2.mixin(s3_1.S3, gateway_1.Gateway, lambda_1.Lambda)
    ], Amazon);
    return Amazon;
}(classes_1.Provider));
exports.Amazon = Amazon;
//# sourceMappingURL=index.js.map