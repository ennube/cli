import {Project} from '../../classes';
import {storage} from '@ennube/runtime';
import {pascalCase, paramCase} from 'change-case';

import * as ProgressBar from 'progress';
import * as chalk from 'chalk';

import * as aws from 'aws-sdk';
const s3 = require('s3');  // @types/s3 not available


export function getS3BucketId(project: Project, bucket: storage.Bucket, stage:string) {
    if(bucket.staged === false)
        return `${pascalCase(project.name)}${pascalCase(bucket.name)}Storage`;
    else
        return `${pascalCase(project.name)}${pascalCase(bucket.name)}${pascalCase(stage)}Storage`;
}

export function getS3BucketName(project:Project, bucket: storage.Bucket, stage:string) {
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
//                    Prefix: `${(new Date()).toJSON()}/`,
                },
            };

            let progressBar = undefined;
            let lastAmount = 0;
            let uploader = client.uploadDir(params)
            .on('progress', function() {
                if( uploader.progressTotal == 0)
                    return;

                if( progressBar === undefined )
                    progressBar = new ProgressBar('Syncing deployment bucket [:bar] :percent :etas', {
                            incomplete: chalk.grey('\u2588'),
                            complete: chalk.white('\u2588'),
                            total: uploader.progressTotal,
                            width: process.stdout['columns'] | 40,
                    });

                progressBar.tick(uploader.progressAmount-lastAmount);
                lastAmount = uploader.progressAmount;
            })
            .on('end', function() {
                console.log("done uploading");
                resolve()
            })
            .on('error', function(err) {
                console.error("unable to sync:", err);
                reject(err);
            });
        });
    }



}
