"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var core_1 = require('../../core');
var Deployment = (function (_super) {
    __extends(Deployment, _super);
    function Deployment(project, stage, region) {
        if (stage === void 0) { stage = 'development'; }
        if (region === void 0) { region = 'us-east-1'; }
        _super.call(this, "Deploying " + project.name + " " + stage + " stage on " + region);
        this.project = project;
        this.stage = stage;
        this.region = region;
    }
    Object.defineProperty(Deployment.prototype, "stackName", {
        get: function () {
            return this.project.name + "-" + this.stage;
        },
        enumerable: true,
        configurable: true
    });
    return Deployment;
}(core_1.SerialTask));
exports.Deployment = Deployment;
var PrepareStack = (function (_super) {
    __extends(PrepareStack, _super);
    function PrepareStack(deployment) {
        _super.call(this, "Preparing stack " + deployment.name);
    }
    return PrepareStack;
}(core_1.SerialTask));
var EnsureBucket = (function (_super) {
    __extends(EnsureBucket, _super);
    function EnsureBucket(bucket) {
        _super.call(this, "Ensuring the existence of the bucket " + bucket.name);
        this.bucket = bucket;
    }
    EnsureBucket.prototype.perform = function () {
        return this.bucket.create();
    };
    return EnsureBucket;
}(core_1.Step));
exports.EnsureBucket = EnsureBucket;
//# sourceMappingURL=index.js.map