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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var common_1 = require('./common');
var sdk_1 = require('@ennube/sdk');
function send(request) {
    return new Promise(function (resolve, reject) {
        request
            .on('success', function (response) { return resolve(response); })
            .on('error', function (response) { return reject(response); })
            .send();
    });
}
var Template = (function (_super) {
    __extends(Template, _super);
    function Template() {
        _super.apply(this, arguments);
        this.formatVersion = "2010-09-09";
        this.description = "";
        this.metadata = {};
        this.parameters = {};
        this.mappings = {};
        this.conditions = {};
        this.resources = {};
        this.outputs = {};
    }
    __decorate([
        sdk_1.Schema.field({ key: 'AWSTemplateFormatVersion' }), 
        __metadata('design:type', String)
    ], Template.prototype, "formatVersion", void 0);
    __decorate([
        sdk_1.Schema.field({ key: 'Description' }), 
        __metadata('design:type', String)
    ], Template.prototype, "description", void 0);
    __decorate([
        sdk_1.Schema.field({ key: 'Metadata' }), 
        __metadata('design:type', Object)
    ], Template.prototype, "metadata", void 0);
    __decorate([
        sdk_1.Schema.field({ key: 'Parameters' }), 
        __metadata('design:type', Object)
    ], Template.prototype, "parameters", void 0);
    __decorate([
        sdk_1.Schema.field({ key: 'Mappings' }), 
        __metadata('design:type', Object)
    ], Template.prototype, "mappings", void 0);
    __decorate([
        sdk_1.Schema.field({ key: 'Conditions' }), 
        __metadata('design:type', Object)
    ], Template.prototype, "conditions", void 0);
    __decorate([
        sdk_1.Schema.field({ key: 'Resources', nextTypes: [common_1.Resource] }), 
        __metadata('design:type', Object)
    ], Template.prototype, "resources", void 0);
    __decorate([
        sdk_1.Schema.field({ key: 'Outputs' }), 
        __metadata('design:type', Object)
    ], Template.prototype, "outputs", void 0);
    Template = __decorate([
        sdk_1.Schema.model(), 
        __metadata('design:paramtypes', [])
    ], Template);
    return Template;
}(sdk_1.Model));
exports.Template = Template;
//# sourceMappingURL=cloudFormation.js.map