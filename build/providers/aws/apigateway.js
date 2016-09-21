"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var cloudformation_1 = require('./cloudformation');
var change_case_1 = require('change-case');
var _ = require('lodash');
var RestApi = (function (_super) {
    __extends(RestApi, _super);
    function RestApi(stack, gateway) {
        _super.call(this, stack);
        this.gateway = gateway;
    }
    Object.defineProperty(RestApi.prototype, "type", {
        get: function () {
            return 'AWS::ApiGateway::RestApi';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RestApi.prototype, "id", {
        get: function () {
            return "Gateway" + change_case_1.pascalCase(this.gateway.name);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RestApi.prototype, "properties", {
        get: function () {
            return {
                Name: this.stack.project.name + "-" + this.gateway.name
            };
        },
        enumerable: true,
        configurable: true
    });
    return RestApi;
}(cloudformation_1.Resource));
exports.RestApi = RestApi;
var Endpoint = (function (_super) {
    __extends(Endpoint, _super);
    function Endpoint(restApi, parent, urlPart) {
        _super.call(this, restApi.stack);
        this.restApi = restApi;
        this.parent = parent;
        this.urlPart = urlPart;
    }
    Object.defineProperty(Endpoint.prototype, "type", {
        get: function () {
            return 'AWS::ApiGateway::Resource';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Endpoint.prototype, "id", {
        get: function () {
            if (this.parent)
                return this.parent.id + "SLASH" + change_case_1.pascalCase(this.urlPart);
            else
                return this.restApi.id + "SLASH" + change_case_1.pascalCase(this.urlPart);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Endpoint.prototype, "properties", {
        get: function () {
            return {
                RestApiId: this.restApi.ref,
                ParentId: this.parent !== undefined ?
                    this.parent.ref :
                    this.restApi.getAtt('RootResourceId'),
                PathPart: this.urlPart
            };
        },
        enumerable: true,
        configurable: true
    });
    return Endpoint;
}(cloudformation_1.Resource));
exports.Endpoint = Endpoint;
var statusCodes = {
    GET: [200, 301, 400, 401, 403, 404, 500],
    POST: [201, 303, 400, 401, 403, 404, 500],
    PUT: [201, 303, 400, 401, 403, 404, 500],
    DELETE: [201, 303, 400, 401, 403, 404, 500],
};
var responseModels = {
    'text/html': 'Empty',
    'application/json': 'Empty',
};
var responseParameters = {
    'method.response.header.location': false,
};
var defaultResponseParameters = {};
var defaultResponseTemplates = {
    'text/http': "#set($inputRoot = $input.path('$'))\n$inputRoot.content",
    'application/json': "#set($inputRoot = $input.path('$'))\n$inputRoot.content",
};
var redirectionResponseParameters = {
    'method.response.header.location': "integration.response.body.errorMessage",
};
var redirectionResponseTemplates = {
    'text/html': "",
    'application/json': "",
};
var errorResponseParameters = {};
var errorResponseTemplates = {
    'text/http': "#set($_body = $util.parseJson($input.path('$.errorMessage'))[1])\n$_body.content",
    'application/json': "#set($_body = $util.parseJson($input.path('$.errorMessage'))[1])\n$_body.content",
};
var Method = (function (_super) {
    __extends(Method, _super);
    function Method(restApi, parent, params) {
        _super.call(this, restApi.stack);
        this.restApi = restApi;
        this.parent = parent;
        Object.assign(this, params);
    }
    Object.defineProperty(Method.prototype, "type", {
        get: function () {
            return 'AWS::ApiGateway::Method';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Method.prototype, "id", {
        get: function () {
            if (this.parent)
                return "" + this.parent.id + this.httpMethod;
            else
                return "" + this.restApi.id + this.httpMethod;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Method.prototype, "properties", {
        get: function () {
            return {
                RestApiId: this.restApi.ref,
                ResourceId: this.parent !== undefined ?
                    this.parent.ref :
                    this.restApi.getAtt('RootResourceId'),
                HttpMethod: this.httpMethod,
                AuthorizationType: 'NONE',
                RequestParameters: this.requestParameters,
                Integration: {
                    Type: this.integrationType,
                    IntegrationHttpMethod: 'POST',
                    IntegrationResponses: this.integrationResponses,
                    Uri: this.integrationUri,
                },
                MethodResponses: this.methodResponses,
            };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Method.prototype, "requestParameters", {
        get: function () {
            return _.fromPairs(this.urlParams.map(function (param) {
                return [("method.request.path." + param), true];
            }));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Method.prototype, "integrationType", {
        get: function () { },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Method.prototype, "integrationUri", {
        get: function () { },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Method.prototype, "integrationResponses", {
        get: function () {
            return statusCodes[this.httpMethod].map(function (statusCode) {
                if (200 <= statusCode && statusCode < 300)
                    return {
                        StatusCode: statusCode,
                        SelectionPattern: undefined,
                        ResponseParameters: defaultResponseParameters,
                        ResponseTemplates: defaultResponseTemplates
                    };
                else if (300 <= statusCode && statusCode < 400)
                    return {
                        StatusCode: statusCode,
                        SelectionPattern: 'http.*',
                        ResponseParameters: redirectionResponseParameters,
                        ResponseTemplates: redirectionResponseTemplates,
                    };
                else if (400 <= statusCode)
                    return {
                        StatusCode: statusCode,
                        SelectionPattern: "\\[" + statusCode + ",.*",
                        ResponseParameters: errorResponseParameters,
                        ResponseTemplates: errorResponseTemplates,
                    };
            });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Method.prototype, "methodResponses", {
        get: function () {
            return statusCodes[this.httpMethod].map(function (statusCode) {
                return {
                    StatusCode: statusCode,
                    ResponseModels: responseModels,
                    ResponseParameters: responseParameters
                };
            });
        },
        enumerable: true,
        configurable: true
    });
    return Method;
}(cloudformation_1.Resource));
exports.Method = Method;
var LambdaMethod = (function (_super) {
    __extends(LambdaMethod, _super);
    function LambdaMethod(restApi, parent, params) {
        _super.call(this, restApi, parent, params);
        Object.assign(this, params);
    }
    Object.defineProperty(LambdaMethod.prototype, "integrationType", {
        get: function () {
            return 'AWS';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LambdaMethod.prototype, "integrationUri", {
        get: function () {
            return cloudformation_1.fn.join('', 'arn:aws:apigateway:', cloudformation_1.fn.ref('AWS::Region'), ':lambda:path/2015-03-31/functions/', this.function.getAtt('Arn'), '/invocations');
        },
        enumerable: true,
        configurable: true
    });
    return LambdaMethod;
}(Method));
exports.LambdaMethod = LambdaMethod;
var Deployment = (function (_super) {
    __extends(Deployment, _super);
    function Deployment(restApi, dependsOn) {
        _super.call(this, restApi.stack);
        this.restApi = restApi;
        this.dependsOn = dependsOn;
    }
    Object.defineProperty(Deployment.prototype, "type", {
        get: function () {
            return 'AWS::ApiGateway::Deployment';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Deployment.prototype, "id", {
        get: function () {
            return "" + this.restApi.id + change_case_1.pascalCase(this.stack.stage) + "Deployment";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Deployment.prototype, "properties", {
        get: function () {
            return {
                RestApiId: this.restApi.ref,
                StageName: "" + change_case_1.pascalCase(this.stack.stage),
            };
        },
        enumerable: true,
        configurable: true
    });
    return Deployment;
}(cloudformation_1.Resource));
exports.Deployment = Deployment;
//# sourceMappingURL=apigateway.js.map