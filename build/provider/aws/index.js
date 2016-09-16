"use strict";
var _common = require('./common');
exports.common = _common;
var _cloudFormation = require('./cloudFormation');
exports.cloudFormation = _cloudFormation;
var _gateway = require('./gateway');
exports.gateway = _gateway;
var _lambda = require('./lambda');
exports.lambda = _lambda;
var _s3 = require('./s3');
exports.s3 = _s3;
var aws = require('aws-sdk');
function send(request) {
    return new Promise(function (resolve, reject) {
        request
            .on('success', function (response) { return resolve(response); })
            .on('error', function (response) { return reject(response); })
            .send();
    });
}
var CloudFormationClient = (function () {
    function CloudFormationClient() {
        this.client = new aws['CloudFormation']({
            region: 'us-east-1'
        });
    }
    CloudFormationClient.prototype.validateTemplate = function (template) {
        return send(this.client.validateTemplate({
            TemplateBody: JSON.stringify(template)
        }));
    };
    return CloudFormationClient;
}());
exports.CloudFormationClient = CloudFormationClient;
//# sourceMappingURL=index.js.map