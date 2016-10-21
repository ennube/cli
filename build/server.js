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
var shell_1 = require('./shell');
var builder_1 = require('./builder');
//import {allServiceDescriptors, mainEntry} from '@ennube/runtime';
var nodeHttp = require('http');
var runtime_1 = require('@ennube/runtime');
var _ = require('lodash');
var Server = (function () {
    function Server() {
        /*
            matchers: {
                matcher: (httpEvent: http.RequestData) => boolean,
                gatewayName: string,
                resource: string,
            }[] = [];
        */
        this.matchers = [];
    }
    //    server: nodeHttp.Server;
    Server.prototype.serve = function (builder) {
        var _this = this;
        var port = 4000;
        return builder.build()
            .then(function () {
            _this.buildMatchers();
            nodeHttp.createServer(function (req, res) { return _this.requestHandler(req, res); })
                .listen(port, function () {
                console.log("Server listening on: http://localhost:" + port);
            });
        });
    };
    Server.prototype.buildMatchers = function () {
        for (var gatewayName in runtime_1.http.allGateways) {
            var gateway = runtime_1.http.allGateways[gatewayName];
            for (var resource in gateway.endpoints)
                this.matchers.push(this.buildMatcher(gatewayName, resource));
        }
    };
    Server.prototype.buildMatcher = function (gateway, resource) {
        var parts = [];
        var params = [];
        for (var _i = 0, _a = _.trim(resource, '/').split('/'); _i < _a.length; _i++) {
            var part = _a[_i];
            var match = /\{([\-\w]+)\}/.exec(part);
            if (match) {
                params.push(match[1]);
                parts.push('([_\\w\\-]*)');
                continue;
            }
            match = /\{([\-\w]+)\+\}/.exec(part);
            if (match) {
                params.push(match[1]);
                parts.push('(.*)');
                break;
            }
            parts.push(part);
        }
        var pattern = new RegExp(parts.join('\\/'));
        return function (httpEvent) {
            var match = pattern.exec(_.trim(httpEvent.path, '/'));
            if (match) {
                console.log('MATCHED URL', match, pattern);
                httpEvent.resource = resource;
                httpEvent.stageVariables['gatewayName'] = gateway;
                for (var n in params)
                    httpEvent.pathParameters[params[n]] = match[Number(n) + 1];
                console.log(httpEvent);
                return true;
            }
            return false;
        };
    };
    Server.prototype.requestHandler = function (request, response) {
        console.log(request.method, request.url);
        var httpEvent = {
            httpMethod: request.method,
            resource: '',
            path: request.url,
            pathParameters: {},
            queryStringParameters: {},
            headers: {},
            stageVariables: {},
            //requestContext: {},
            body: ''
        };
        var context = {};
        for (var _i = 0, _a = this.matchers; _i < _a.length; _i++) {
            var matcher = _a[_i];
            if (matcher(httpEvent)) {
                runtime_1.mainEntry(httpEvent, context, function (error, success) {
                    if (error === null) {
                        response.writeHead(success.statusCode, success.headers);
                        response.end(success.body);
                    }
                    else
                        throw error;
                });
                return;
            }
        }
        response.writeHead(404);
        response.end();
    };
    __decorate([
        shell_1.command('serve'), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [builder_1.Builder]), 
        __metadata('design:returntype', void 0)
    ], Server.prototype, "serve", null);
    Server = __decorate([
        shell_1.manager(), 
        __metadata('design:paramtypes', [])
    ], Server);
    return Server;
}());
exports.Server = Server;
//# sourceMappingURL=server.js.map