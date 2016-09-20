import {Project} from '../../classes';
import {ref, getAtt, getStackName} from './common';
import {getS3BucketId} from './s3';
import {allServices, storage} from '@ennube/runtime';
import {pascalCase} from 'change-case';

function getLambdaId(serviceName: string, stage: string) {
    return `${serviceName}${pascalCase(stage)}Lambda`;
}

export class Lambda {
    region: string;
    stage: string;
    project: Project;
    Resources: {
        [resourceId:string]: {
            Type: string,
            Properties: Object
        }
    };

    prepareLambdaTemplate() {
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
                PolicyName: `${getStackName(this.project.name, this.stage)}ServicePolicy`,
                PolicyDocument: {
                    Version: '2012-10-17',
                    Statement: [{
                        Effect: "Allow",
                        Action: [
                          "logs:CreateLogGroup",
                          "logs:CreateLogStream",
                          "logs:PutLogEvents"
                        ],
                        Resource: `arn:aws:logs:${this.region}:*:*`
                    }]
                },
                Roles: [
                    ref('ServiceRole')
                ]
            }
        }

        let deploymentBucket = storage.allBuckets['deployment'];
        for(let serviceName in allServices) {
            let service = allServices[serviceName];
            let lambdaId = getLambdaId(serviceName, this.stage);
            this.Resources[lambdaId] = {
                Type: 'AWS::Lambda::Function',
                Properties: {
                    FunctionName: lambdaId,
                    Runtime: 'nodejs4.3',
                    MemorySize: service.memoryLimit,
                    Timeout: service.timeLimit,
                    Handler: `${serviceName}.handler`,
                    Role: getAtt('ServiceRole', 'Arn'),
                    Code: {
                        S3Bucket: ref(getS3BucketId(this.project, deploymentBucket, this.stage)),
                        S3Key: `${serviceName}.zip`
                    },
                }
            };
        }
    }
}
