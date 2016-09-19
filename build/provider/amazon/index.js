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
var classes_1 = require('../../classes');
var common_1 = require('./common');
var fs = require('fs-extra');
var yaml = require('js-yaml');
var aws = require('aws-sdk');
var common_2 = require('./common');
var gateway_1 = require('./gateway');
var s3_1 = require('./s3');
var Amazon = (function () {
    function Amazon(project) {
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
        fs.writeFileSync('template.yaml', yaml.dump(this.Template));
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
        classes_1.Shell.command('upload'), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [Object]), 
        __metadata('design:returntype', void 0)
    ], Amazon.prototype, "upload", null);
    __decorate([
        classes_1.Shell.command('validate'), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [Object]), 
        __metadata('design:returntype', void 0)
    ], Amazon.prototype, "validate", null);
    __decorate([
        classes_1.Shell.command('describe'), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [Object]), 
        __metadata('design:returntype', void 0)
    ], Amazon.prototype, "describe", null);
    __decorate([
        classes_1.Shell.command('create'), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [Object]), 
        __metadata('design:returntype', void 0)
    ], Amazon.prototype, "create", null);
    Amazon = __decorate([
        common_2.mixin(gateway_1.Gateway, s3_1.S3), 
        __metadata('design:paramtypes', [classes_1.Project])
    ], Amazon);
    return Amazon;
}());
exports.Amazon = Amazon;
//# sourceMappingURL=index.js.map