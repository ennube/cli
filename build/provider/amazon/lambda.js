"use strict";
var common_1 = require('./common');
var s3_1 = require('./s3');
var runtime_1 = require('@ennube/runtime');
function getLambdaId(serviceName, stage) {
    return "" + serviceName + stage + "Lambda";
}
var Lambda = (function () {
    function Lambda() {
    }
    Lambda.prototype.prepareLambdaTemplate = function () {
        this.Resources['ServiceRole'] = {
            Type: 'AWS::IAM::Role',
            Properties: {
                Path: "/",
                AssumeRolePolicyDocument: {
                    Version: "2012-10-17",
                    Statement: [{
                            Effect: "Allow",
                            Principal: {
                                Service: ["lambda.amazonaws.com"]
                            },
                            Action: ["sts:AssumeRole"]
                        }]
                },
            }
        };
        this.Resources['ServicePolicy'] = {
            Type: 'AWS::IAM::Policy',
            Properties: {
                PolicyName: common_1.getStackName(this.project.name, this.stage) + "ServicePolicy",
                PolicyDocument: {
                    Version: '2012-10-17',
                    Statement: [{
                            Effect: "Allow",
                            Action: [
                                "logs:CreateLogGroup",
                                "logs:CreateLogStream",
                                "logs:PutLogEvents"
                            ],
                            Resource: "arn:aws:logs:" + this.region + ":*:*"
                        }]
                },
                Roles: [
                    common_1.ref('ServiceRole')
                ]
            }
        };
        var deploymentBucket = runtime_1.storage.allBuckets['deployment'];
        for (var serviceName in runtime_1.allServices) {
            var service = runtime_1.allServices[serviceName];
            var lambdaId = getLambdaId(serviceName, this.stage);
            this.Resources[lambdaId] = {
                Type: 'AWS::Lambda::Function',
                Properties: {
                    FunctionName: lambdaId,
                    Runtime: 'nodejs4.3',
                    MemorySize: service.memoryLimit,
                    Timeout: service.timeLimit,
                    Handler: serviceName + ".handler",
                    Role: common_1.getAtt('ServiceRole', 'Arn'),
                    Code: {
                        S3Bucket: common_1.ref(s3_1.getS3BucketId(this.project, deploymentBucket, this.stage)),
                        S3Key: serviceName + ".zip"
                    },
                }
            };
        }
    };
    return Lambda;
}());
exports.Lambda = Lambda;
//# sourceMappingURL=lambda.js.map