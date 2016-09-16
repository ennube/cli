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
var sdk_1 = require('@ennube/sdk');
var change_case_1 = require('change-case');
var _ = require('lodash');
var yaml = require('js-yaml');
var aws = require('aws-sdk');
var Amazon = (function () {
    function Amazon(project) {
        this.project = project;
        this.Metadata = {};
        this.Parameters = {};
        this.Mappings = {};
        this.Conditions = {};
        this.Resources = {};
        this.Outputs = {};
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
        project.loadMainModule();
        this.buildGateway();
    }
    Amazon.prototype.buildGateway = function () {
        var _this = this;
        gatewayIterator(function (gateway, url, method, endpoint) {
            _this.ensureGateway(gateway);
            var urlId = _this.ensureGatewayUrl(gateway, url);
            _this.createGatewayUrlMethod(gateway, urlId, method, '<lambda id>');
        });
        console.log(yaml.dump(this.Template));
    };
    Amazon.prototype.ensureGateway = function (gateway) {
        var id = gatewayId(gateway);
        if (id in this.Resources)
            return;
        this.Resources[id] = {
            Type: 'AWS::ApiGateway::RestApi',
            Properties: {
                Name: change_case_1.pascalCase(gateway)
            }
        };
    };
    Amazon.prototype.ensureGatewayUrl = function (gateway, url) {
        url = _.trim(url, '/');
        if (!url.length)
            return;
        var parts = [];
        var prevId;
        for (var _i = 0, _a = url.split('/'); _i < _a.length; _i++) {
            var urlPart = _a[_i];
            parts.push(urlPart);
            var id = gatewayUrlId(gateway, parts);
            if (id in this.Resources)
                continue;
            this.Resources[id] = {
                Type: 'AWS::ApiGateway::Resource',
                Properties: {
                    RestApiId: ref(gatewayId(gateway)),
                    ParentId: prevId ? ref(prevId) :
                        getAtt(gatewayId(gateway), 'RootResourceId'),
                    PathPart: urlPart
                }
            };
            prevId = id;
        }
        return prevId;
    };
    Amazon.prototype.createGatewayUrlMethod = function (gateway, resourceId, method, lambdaId) {
        var id = resourceId + method.toUpperCase();
        this.Resources[id] = {
            Type: 'AWS::ApiGateway::Method',
            Properties: {
                RestApiId: ref(gatewayId(gateway)),
                ResourceID: resourceId ? ref(resourceId) :
                    getAtt(gatewayId(gateway), 'RootResourceId'),
                HttpMethod: method.toLowerCase(),
                RequestParameters: {},
                Integration: {},
            }
        };
    };
    Amazon.prototype.validate = function (args) {
        this.send('validateTemplate', {
            TemplateBody: JSON.stringify(this.Template)
        })
            .then(function (x) { return console.log('OK'); })
            .catch(function (x) { return console.log('ER', x); });
    };
    Amazon.prototype.create = function (args) {
        var stage;
        this.send('createStack', {
            StackName: stackName(this.project.npm.name, stage),
            TemplateBody: JSON.stringify(this.Template),
            OnFailure: 'DELETE',
        })
            .then(function (x) { return console.log('OK'); })
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
function stackName(projectName, stage) {
    return change_case_1.pascalCase(projectName) + "-" + change_case_1.pascalCase(stage);
}
function ref(id) {
    return { Ref: id };
}
function getAtt(id, attr) {
    return { "Fn::GetAtt": [id, attr] };
}
function gatewayId(gateway) {
    return "Gateway" + change_case_1.pascalCase(gateway);
}
function gatewayUrlId(gateway, parts) {
    return gatewayId(gateway) + "URL" +
        parts.map(function (v) { return change_case_1.pascalCase(_.trim(v, '{}')); }).join('SLASH');
}
function gatewayIterator(callback) {
    for (var gatewayId_1 in sdk_1.http.allGateways) {
        var gateway = sdk_1.http.allGateways[gatewayId_1];
        for (var url in gateway.endpoints) {
            var urlMethods = gateway.endpoints[url];
            for (var method in urlMethods)
                callback(gatewayId_1, url, method, urlMethods[method]);
        }
    }
}
//# sourceMappingURL=index.js.map