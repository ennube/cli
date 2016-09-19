import {Project} from '../../classes';
import {storage} from '@ennube/runtime';
import {pascalCase, paramCase} from 'change-case';

import * as aws from 'aws-sdk';

//import * as s3 from 's3';

const s3 = require('s3'); // @types not available


function getS3BucketId(project: Project, bucket: storage.Bucket, stage:string) {
    if(bucket.staged === false)
        return `${pascalCase(project.name)}${pascalCase(bucket.name)}Storage`;
    else
        return `${pascalCase(project.name)}${pascalCase(bucket.name)}${pascalCase(stage)}Storage`;
}

function getS3BucketName(project:Project, bucket: storage.Bucket, stage:string) {
    return paramCase(getS3BucketId(project, bucket, stage));
}


export class S3 {
    stage: string;
    region: string;

    project: Project;
    Resources: Object;


    prepareS3Template() {
        for(let bucketName in storage.allBuckets) {
            let bucket = storage.allBuckets[bucketName];
            let bucketId = getS3BucketId(this.project, bucket, this.stage);

            this.Resources[bucketId] = {
                Type: 'AWS::S3::Bucket',
                Properties: {
                    BucketName: getS3BucketName(this.project, bucket, this.stage),
                    AccessControl: bucket.accessControl,
                }
            }
            /*
            this.Outputs[bucketId] = {
                Value: ref(bucketId),
            };*/
        }
    }

    uploadDeploymentFiles() {
        return new Promise<void>((resolve, reject) => {
            let deploymentBucket = storage.allBuckets['deployment'];
            var awsS3Client = new aws.S3({});
            var client = s3.createClient({
                s3Client: awsS3Client,
            });
            var params = {
                localDir: `${this.project.deploymentDir}`,
                deleteRemoved: true,
                s3Params: {
                    Bucket: getS3BucketName(this.project, deploymentBucket, this.stage),
                    Prefix: `${(new Date()).toJSON()}/`,
                },
            };

            var uploader = client.uploadDir(params);
            uploader.on('error', function(err) {
                console.error("unable to sync:", err.stack);
            });
            uploader.on('progress', function() {
                console.log("progress", uploader.progressAmount, uploader.progressTotal);
            });
            uploader.on('end', function() {
                console.log("done uploading");
                resolve()
            });
        });
    }



}
