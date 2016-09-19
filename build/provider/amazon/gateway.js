"use strict";
var runtime_1 = require('@ennube/runtime');
var common_1 = require('./common');
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
                                RestApiId: common_1.ref(gatewayId),
                                ParentId: parentResourceId ?
                                    common_1.ref(parentResourceId) :
                                    common_1.getAtt(gatewayId, 'RootResourceId'),
                                PathPart: urlPart
                            }
                        };
                    parentResourceId = resourceId;
                }
            var methodId = getGatewayUrlMethodId(gateway, urlParts, method);
            _this.Resources[methodId] = {
                Type: 'AWS::ApiGateway::Method',
                Properties: {
                    RestApiId: common_1.ref(gatewayId),
                    ResourceId: parentResourceId ?
                        common_1.ref(parentResourceId) :
                        common_1.getAtt(gatewayId, 'RootResourceId'),
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
    };
    Gateway.prototype.prepareGatewayMOCKTemplate = function () {
    };
    Gateway.prototype.prepareGatewayLambdaTemplate = function () {
    };
    Gateway.prototype.prepareGatewayHTTPTemplate = function () {
    };
    return Gateway;
}());
exports.Gateway = Gateway;
//# sourceMappingURL=gateway.js.map