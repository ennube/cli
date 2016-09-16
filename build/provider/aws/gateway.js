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
var Gateway = (function (_super) {
    __extends(Gateway, _super);
    function Gateway() {
        _super.apply(this, arguments);
    }
    Gateway.type = 'AWS::ApiGateway::RestApi';
    __decorate([
        sdk_1.Schema.field({ key: "name" }), 
        __metadata('design:type', String)
    ], Gateway.prototype, "name", void 0);
    Gateway = __decorate([
        sdk_1.Schema.model(), 
        __metadata('design:paramtypes', [])
    ], Gateway);
    return Gateway;
}(common_1.Resource));
exports.Gateway = Gateway;
var Stage = (function (_super) {
    __extends(Stage, _super);
    function Stage() {
        _super.apply(this, arguments);
    }
    Stage.type = 'AWS::ApiGateway::Stage';
    Stage = __decorate([
        sdk_1.Schema.model(), 
        __metadata('design:paramtypes', [])
    ], Stage);
    return Stage;
}(common_1.Resource));
exports.Stage = Stage;
var URLEntry = (function (_super) {
    __extends(URLEntry, _super);
    function URLEntry() {
        _super.apply(this, arguments);
    }
    URLEntry.type = 'AWS::ApiGateway::Resource';
    URLEntry = __decorate([
        sdk_1.Schema.model(), 
        __metadata('design:paramtypes', [])
    ], URLEntry);
    return URLEntry;
}(common_1.Resource));
exports.URLEntry = URLEntry;
//# sourceMappingURL=gateway.js.map