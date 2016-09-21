"use strict";
var change_case_1 = require('change-case');
var common_1 = require('./common');
var ProgressBar = require('progress');
var chalk = require('chalk');
var aws = require('aws-sdk');
var s3 = require('s3');
function getS3BucketId(project, bucket, stage) {
    if (bucket.staged === false)
        return "" + change_case_1.pascalCase(project.name) + change_case_1.pascalCase(bucket.name) + "Storage";
    else
        return "" + change_case_1.pascalCase(project.name) + change_case_1.pascalCase(bucket.name) + change_case_1.pascalCase(stage) + "Storage";
}
exports.getS3BucketId = getS3BucketId;
function getS3BucketName(project, bucket, stage) {
    return change_case_1.paramCase(getS3BucketId(project, bucket, stage));
}
exports.getS3BucketName = getS3BucketName;
var S3 = (function () {
    function S3() {
    }
    S3.prototype.prepareS3Template = function () {
    };
    S3.prototype.uploadDeploymentFiles = function () {
        var _this = this;
        console.log("uploading to " + this.deploymentBucketName);
        var awsS3Client = new aws.S3();
        var s3Client = s3.createClient({ s3Client: awsS3Client });
        return common_1.send(function () { return awsS3Client.createBucket({
            Bucket: _this.deploymentBucketName,
            CreateBucketConfiguration: {
                LocationConstraint: _this.region
            }
        }); })
            .catch(function () { return console.log("Bucket creation failed"); })
            .then(function () { return new Promise(function (resolve, reject) {
            var progressBar = undefined;
            var lastAmount = 0;
            var uploader = s3Client.uploadDir({
                localDir: "" + _this.project.deploymentDir,
                s3Params: {
                    Bucket: _this.deploymentBucketName,
                    Prefix: _this.deployHash + "/",
                },
            })
                .on('progress', function () {
                if (uploader == undefined || uploader.progressTotal == 0)
                    return;
                if (progressBar === undefined)
                    progressBar = new ProgressBar('Syncing deployment bucket [:bar] :percent :etas', {
                        incomplete: chalk.grey('\u2588'),
                        complete: chalk.white('\u2588'),
                        total: uploader.progressTotal,
                        width: process.stdout['columns'] | 40,
                    });
                progressBar.tick(uploader.progressAmount - lastAmount);
                lastAmount = uploader.progressAmount;
            })
                .on('end', function () {
                resolve();
            })
                .on('error', function (err) {
                reject(err);
            });
        }); });
    };
    return S3;
}());
exports.S3 = S3;
//# sourceMappingURL=s3.js.map