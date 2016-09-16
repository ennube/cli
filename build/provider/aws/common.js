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
var sdk_1 = require('@ennube/sdk');
var Resource = (function (_super) {
    __extends(Resource, _super);
    function Resource() {
        _super.apply(this, arguments);
    }
    Resource.polymorphicId = function () {
        return this.type;
    };
    Resource.prototype.polymorphicOutgoingFilter = function (Resource) {
        return {
            Type: sdk_1.getTypeOf(this).polymorphicId(),
            Resource: Resource
        };
    };
    Resource = __decorate([
        sdk_1.Schema.model(), 
        __metadata('design:paramtypes', [])
    ], Resource);
    return Resource;
}(sdk_1.Model));
exports.Resource = Resource;
//# sourceMappingURL=common.js.map