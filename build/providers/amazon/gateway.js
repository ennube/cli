"use strict";
var runtime_1 = require('@ennube/runtime');
var common_1 = require('./common');
var lambda_1 = require('./lambda');
var change_case_1 = require('change-case');
var _ = require('lodash');
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
function methodResponse(statusCode) {
    var responseModels = {
        'text/html': 'Empty',
        'application/json': 'Empty',
    };
    var responseParameters = {
        'method.response.header.location': false,
    };
    if (statusCode >= 300 && statusCode < 400)
        Object.assign(responseParameters, {
            'method.response.header.location': true,
        });
    return {
        StatusCode: statusCode,
        ResponseModels: responseModels,
        ResponseParameters: responseParameters
    };
}
function integrationResponse(statusCode) {
    var selectionPattern = undefined;
    var responseParameters = {};
    var responseTemplates = {};
    if (statusCode == 200) {
        responseTemplates = {
            'text/http': "#set($inputRoot = $input.path('$'))\n$inputRoot.content",
            'application/json': "#set($inputRoot = $input.path('$'))\n$inputRoot.content",
        };
    }
    else if (statusCode >= 300 && statusCode < 400) {
        selectionPattern = 'http.*';
        Object.assign(responseParameters, {
            'method.response.header.location': "integration.response.body.errorMessage",
        });
        Object.assign(responseTemplates, {
            'text/html': "",
            'application/json': "",
        });
    }
    else if (statusCode >= 400 && statusCode <= 500) {
        selectionPattern = "\\[" + statusCode + ".*";
        responseTemplates = {
            'text/http': "#set($_body = $util.parseJson($input.path('$.errorMessage'))[1])\n$_body.content",
            'application/json': "#set($_body = $util.parseJson($input.path('$.errorMessage'))[1])\n$_body.content",
        };
    }
    return {
        StatusCode: statusCode,
        SelectionPattern: selectionPattern,
        ResponseParameters: responseParameters,
        ResponseTemplates: responseTemplates,
    };
}
var Gateway = (function () {
    function Gateway() {
    }
    Gateway.prototype.prepareGatewayTemplate = function () {
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
            var requestParameters = {};
            var urlParts = [];
            var urlArgs = [];
            var parentResourceId;
            if (!!url)
                for (var _i = 0, _a = url.split('/'); _i < _a.length; _i++) {
                    var urlPart = _a[_i];
                    var argMatch = /\{([\-\w]+)\}/.exec(urlPart);
                    if (argMatch) {
                        requestParameters[("method.request.path." + argMatch[1])] = true;
                    }
                    urlParts.push(urlPart);
                    var resourceId = getGatewayUrlId(gateway, urlParts);
                    if (!(resourceId in _this.Resources))
                        _this.Resources[resourceId] = {
                            Type: 'AWS::ApiGateway::Resource',
                            Properties: {
                                RestApiId: common_1.fn.ref(gatewayId),
                                ParentId: parentResourceId ?
                                    common_1.fn.ref(parentResourceId) :
                                    common_1.fn.getAtt(gatewayId, 'RootResourceId'),
                                PathPart: urlPart
                            }
                        };
                    parentResourceId = resourceId;
                }
            var methodId = getGatewayUrlMethodId(gateway, urlParts, method);
            _this.Resources[methodId] = {
                Type: 'AWS::ApiGateway::Method',
                Properties: {
                    RestApiId: common_1.fn.ref(gatewayId),
                    ResourceId: parentResourceId ?
                        common_1.fn.ref(parentResourceId) :
                        common_1.fn.getAtt(gatewayId, 'RootResourceId'),
                    HttpMethod: method.toUpperCase(),
                    AuthorizationType: 'NONE',
                    RequestParameters: requestParameters,
                    Integration: {
                        Type: 'MOCK',
                        IntegrationHttpMethod: method.toUpperCase(),
                        IntegrationResponses: [
                            integrationResponse(200),
                            integrationResponse(301),
                            integrationResponse(400),
                            integrationResponse(401),
                            integrationResponse(403),
                            integrationResponse(404),
                            integrationResponse(500),
                        ]
                    },
                    MethodResponses: [
                        methodResponse(200),
                        methodResponse(301),
                        methodResponse(400),
                        methodResponse(401),
                        methodResponse(403),
                        methodResponse(404),
                        methodResponse(500),
                    ],
                }
            };
        });
    };
    Gateway.prototype.prepareGatewayIntegrationTemplate = function () {
        var _this = this;
        var allMethodIds = [];
        gatewayIterator(function (gateway, url, method, endpoint) {
            var methodId = getGatewayUrlMethodId(gateway, _.trim(url, '/').split('/'), method);
            var resource = _this.Resources[methodId];
            _this.prepareGatewayLambdaTemplate(resource.Properties.Integration, endpoint);
            allMethodIds.push(methodId);
        });
        for (var gateway in runtime_1.http.allGateways) {
            var gatewayId = getGatewayId(gateway);
            var deploymentId = "" + gatewayId + change_case_1.pascalCase(this.stage) + "Deployment";
            var stageId = "" + gatewayId + change_case_1.pascalCase(this.stage) + "Stage";
            this.Resources[deploymentId] = {
                Type: 'AWS::ApiGateway::Deployment',
                DependsOn: allMethodIds,
                Properties: {
                    RestApiId: common_1.fn.ref(gatewayId),
                    StageName: "" + change_case_1.pascalCase(this.stage),
                },
            };
        }
    };
    Gateway.prototype.prepareGatewayLambdaTemplate = function (integration, endpoint) {
        integration.Type = 'AWS';
        integration.IntegrationHttpMethod = 'POST';
        integration.Uri = common_1.fn.join('', 'arn:aws:apigateway:', common_1.fn.ref('AWS::Region'), ':lambda:path/2015-03-31/functions/', common_1.fn.getAtt(lambda_1.getLambdaId(endpoint.service.serviceClass.name, this.stage), 'Arn'), '/invocations');
    };
    Gateway.prototype.prepareGatewayMOCKTemplate = function () {
    };
    Gateway.prototype.prepareGatewayHTTPTemplate = function () {
    };
    return Gateway;
}());
exports.Gateway = Gateway;
//# sourceMappingURL=gateway.js.map