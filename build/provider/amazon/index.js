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
var runtime_1 = require('@ennube/runtime');
var change_case_1 = require('change-case');
var _ = require('lodash');
var fs = require('fs-extra');
var yaml = require('js-yaml');
var aws = require('aws-sdk');
var httpResponsecodes = {
    200: 'Found',
};
var Amazon = (function () {
    function Amazon(project) {
        this.project = project;
        this.Metadata = {};
        this.Parameters = {};
        this.Mappings = {};
        this.Conditions = {};
        this.Resources = {};
        this.Outputs = {};
        project.ensureLoaded();
        this.client = new aws['CloudFormation']({
            region: 'us-east-1'
        });
        this.Template = {
            AWSTemplateFormatVersion: "2010-09-09",
            Metadata: this.Metadata,
            Parameters: this.Parameters,
            Mappings: this.Mappings,
            Conditions: this.Conditions,
            Resources: this.Resources,
            Outputs: this.Outputs
        };
        this.buildGateway();
    }
    Amazon.prototype.buildGateway = function () {
        var _this = this;
        gatewayIterator(function (gateway, url, method, endpoint) {
            url = _.trim(url, '/');
            var gatewayId = getGatewayId(gateway);
            if (!(gatewayId in _this.Resources))
                _this.Resources[gatewayId] = {
                    Type: 'AWS::ApiGateway::RestApi',
                    Properties: {
                        Name: _this.project.npm.name + "-" + gateway
                    }
                };
            var urlParts = [];
            var urlArgs = [];
            var parentResourceId;
            if (!!url)
                for (var _i = 0, _a = url.split('/'); _i < _a.length; _i++) {
                    var urlPart = _a[_i];
                    urlParts.push(urlPart);
                    var resourceId = getGatewayUrlId(gateway, urlParts);
                    if (!(resourceId in _this.Resources))
                        _this.Resources[resourceId] = {
                            Type: 'AWS::ApiGateway::Resource',
                            Properties: {
                                RestApiId: ref(gatewayId),
                                ParentId: parentResourceId ?
                                    ref(parentResourceId) :
                                    getAtt(gatewayId, 'RootResourceId'),
                                PathPart: urlPart
                            }
                        };
                    parentResourceId = resourceId;
                }
            var methodId = getGatewayUrlMethodId(gateway, urlParts, method);
            _this.Resources[methodId] = {
                Type: 'AWS::ApiGateway::Method',
                Properties: {
                    RestApiId: ref(gatewayId),
                    ResourceId: parentResourceId ?
                        ref(parentResourceId) :
                        getAtt(gatewayId, 'RootResourceId'),
                    HttpMethod: method.toUpperCase(),
                    AuthorizationType: 'NONE',
                    RequestParameters: {},
                    Integration: {
                        Type: 'MOCK',
                        IntegrationHttpMethod: method.toUpperCase(),
                    },
                }
            };
        });
        fs.writeFileSync('template.yaml', yaml.dump(this.Template));
    };
    Amazon.prototype.validate = function (args) {
        this.send('validateTemplate', {
            TemplateBody: JSON.stringify(this.Template)
        })
            .then(function (x) { return console.log('OK'); })
            .catch(function (x) { return console.log('ER', x); });
    };
    Amazon.prototype.create = function (args) {
        var stage = 'dev';
        this.send('createStack', {
            StackName: getStackName(this.project.npm.name, stage),
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
        classes_1.Shell.command('validate'), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [Object]), 
        __metadata('design:returntype', void 0)
    ], Amazon.prototype, "validate", null);
    __decorate([
        classes_1.Shell.command('create'), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [Object]), 
        __metadata('design:returntype', void 0)
    ], Amazon.prototype, "create", null);
    return Amazon;
}());
exports.Amazon = Amazon;
function getStackName(projectName, stage) {
    return change_case_1.pascalCase(projectName) + "-" + change_case_1.pascalCase(stage);
}
function ref(id) {
    return { Ref: id };
}
function getAtt(id, attr) {
    return { "Fn::GetAtt": [id, attr] };
}
function getGatewayId(gateway) {
    return "Gateway" + change_case_1.pascalCase(gateway);
}
function getGatewayUrlId(gateway, parts) {
    return getGatewayId(gateway) + "URL" +
        parts.map(function (v) { return change_case_1.pascalCase(_.trim(v, '{}')); }).join('SLASH');
}
function getGatewayUrlMethodId(gateway, parts, method) {
    return getGatewayUrlId(gateway, parts) + method.toUpperCase();
}
function gatewayIterator(callback) {
    for (var gatewayId in runtime_1.http.allGateways) {
        var gateway = runtime_1.http.allGateways[gatewayId];
        for (var url in gateway.endpoints) {
            var urlMethods = gateway.endpoints[url];
            for (var method in urlMethods)
                callback(gatewayId, url, method, urlMethods[method]);
        }
    }
}
//# sourceMappingURL=index.js.map