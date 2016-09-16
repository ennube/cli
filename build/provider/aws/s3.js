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
var S3Bucket = (function (_super) {
    __extends(S3Bucket, _super);
    function S3Bucket() {
        _super.apply(this, arguments);
    }
    S3Bucket.type = 'AWS::S3::Bucket';
    S3Bucket = __decorate([
        sdk_1.Schema.model(), 
        __metadata('design:paramtypes', [])
    ], S3Bucket);
    return S3Bucket;
}(common_1.Resource));
exports.S3Bucket = S3Bucket;
//# sourceMappingURL=s3.js.map