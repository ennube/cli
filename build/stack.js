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
var index_1 = require('./index');
var change_case_1 = require('change-case');
var rt = require('@ennube/runtime');
var _ = require('lodash');
var aws = require('./provider/aws');
var sdk_1 = require('@ennube/sdk');
var StackCommandService = (function () {
    function StackCommandService(project) {
        this.project = project;
        this.adapter = new sdk_1.Adapter();
    }
    StackCommandService.prototype.info = function () {
        console.log('HTTP endpoints:');
        _.forEach(rt.http.endpoints, function (endpoint, url) {
            console.log("\t" + endpoint.method + " " + url);
        });
    };
    StackCommandService.prototype.compile = function () {
        console.log('compiling..');
        var cfClient = new aws.CloudFormationClient();
        var template = new aws.cloudFormation.Template;
        template.resources[change_case_1.pascalCase(this.project.npm.name)] = new aws.gateway.Gateway();
        var encodedDocument = this.adapter.outgoing(template, aws.cloudFormation.Template);
        console.log('Encoded document', encodedDocument);
        cfClient.validateTemplate(encodedDocument)
            .then(function (x) { return console.log('OK', x); })
            .catch(function (x) { return console.log('ER', x); });
    };
    __decorate([
        index_1.Shell.command('info'), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], StackCommandService.prototype, "info", null);
    __decorate([
        index_1.Shell.command('compile'), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], StackCommandService.prototype, "compile", null);
    return StackCommandService;
}());
exports.StackCommandService = StackCommandService;
//# sourceMappingURL=stack.js.map