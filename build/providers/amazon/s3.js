"use strict";
var runtime_1 = require('@ennube/runtime');
var change_case_1 = require('change-case');
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
        for (var bucketName in runtime_1.storage.allBuckets) {
            var bucket = runtime_1.storage.allBuckets[bucketName];
            var bucketId = getS3BucketId(this.project, bucket, this.stage);
            this.Resources[bucketId] = {
                Type: 'AWS::S3::Bucket',
                Properties: {
                    BucketName: getS3BucketName(this.project, bucket, this.stage),
                    AccessControl: bucket.accessControl,
                }
            };
        }
    };
    S3.prototype.uploadDeploymentFiles = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var deploymentBucket = runtime_1.storage.allBuckets['deployment'];
            var awsS3Client = new aws.S3({});
            var client = s3.createClient({
                s3Client: awsS3Client,
            });
            var params = {
                localDir: "" + _this.project.deploymentDir,
                deleteRemoved: true,
                s3Params: {
                    Bucket: getS3BucketName(_this.project, deploymentBucket, _this.stage),
                },
            };
            var progressBar = undefined;
            var lastAmount = 0;
            var uploader = client.uploadDir(params)
                .on('progress', function () {
                if (uploader.progressTotal == 0)
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
                console.log("done uploading");
                resolve();
            })
                .on('error', function (err) {
                console.error("unable to sync:", err);
                reject(err);
            });
        });
    };
    return S3;
}());
exports.S3 = S3;
//# sourceMappingURL=s3.js.map