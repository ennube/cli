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
    function Amazon(project) {
        _super.call(this, project);
        this.project = project;
        this.stage = 'development';
        this.region = 'us-east-1';
        this.Metadata = {};
        this.Parameters = {};
        this.Mappings = {};
        this.Conditions = {};
        this.Resources = {};
        this.Outputs = {};
        this.client = new aws['CloudFormation']({
            region: this.region
        });
        this.prepareTemplate();
    }
    Amazon.prototype.prepareTemplate = function () {
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
        fs.writeFileSync('stack-creation.yaml', yaml.dump(this.Template));
        this.prepareLambdaTemplate();
        this.prepareGatewayIntegrationTemplate();
        fs.writeFileSync('stack-update.yaml', yaml.dump(this.Template));
    };
    Amazon.prototype.upload = function (args) {
        return this.uploadDeploymentFiles();
    };
    Amazon.prototype.validate = function (args) {
        this.send('validateTemplate', {
            TemplateBody: JSON.stringify(this.Template)
        })
            .then(function (x) { return console.log('OK'); })
            .catch(function (x) { return console.log('ER', x); });
    };
    Amazon.prototype.describe = function (args) {
        this.send('describeStacks', {
            TemplateBody: JSON.stringify(this.Template)
        })
            .then(function (x) { return console.log('OK'); })
            .catch(function (x) { return console.log('ER', x); });
    };
    Amazon.prototype.create = function (args) {
        var stage = 'dev';
        this.send('createStack', {
            StackName: common_1.getStackName(this.project.npm.name, stage),
            TemplateBody: JSON.stringify(this.Template),
        })
            .then(function (x) { return console.log('OK', x); })
            .catch(function (x) { return console.log('ER', x); });
    };
    Amazon.prototype.send = function (method, params) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.client[method](params)
                .on('success', function (response) { return resolve(response); })
                .on('error', function (response) { return reject(response); })
                .send();
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
        classes_1.command('create')
    ], Amazon.prototype, "create", null);
    Amazon = __decorate([
        common_2.mixin(s3_1.S3, gateway_1.Gateway, lambda_1.Lambda)
    ], Amazon);
    return Amazon;
}(classes_1.Provider));
exports.Amazon = Amazon;
//# sourceMappingURL=index.js.map