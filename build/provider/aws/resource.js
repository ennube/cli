"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var aws = require('aws-sdk');
var Resource = (function () {
    function Resource(service, options) {
        var srv = aws[service];
        if (service === undefined)
            throw new Error("AWS unknow service " + service);
        this.service = new srv(options);
    }
    Resource.prototype.call = function (method, params) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.service[method](params, function () { })
                .on('success', function (response) { return resolve(response.data); })
                .on('error', function (response) { return reject(response.data); });
        });
    };
    return Resource;
}());
exports.Resource = Resource;
;
var Bucket = (function (_super) {
    __extends(Bucket, _super);
    function Bucket(name) {
        _super.call(this, 'S3', {
            params: {
                Bucket: name
            }
        });
        this.name = name;
    }
    Bucket.prototype.create = function () {
        return this.call('createBucket');
    };
    Bucket.prototype.createFolder = function (name, ACL) {
        if (ACL === void 0) { ACL = 'private'; }
        return this.call('upload', {
            Key: name + '/',
            Body: 'body',
            ACL: ACL
        });
    };
    Bucket.prototype.listObjects = function () {
        return this.call('listObjectsV2');
    };
    return Bucket;
}(Resource));
exports.Bucket = Bucket;
//# sourceMappingURL=resource.js.map