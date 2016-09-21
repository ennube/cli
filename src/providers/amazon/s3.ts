import {Project} from '../../project';
import {storage} from '@ennube/runtime';
import {pascalCase, paramCase} from 'change-case';

import {send} from './common';

import * as ProgressBar from 'progress';
import * as chalk from 'chalk';

const aws = require('aws-sdk');// @types/aws-sdk no usable
const s3 = require('s3'); // @types/s3 not available


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
    deployHash:string;

    deploymentBucketName: string;

    project: Project;
    Resources: Object;

    prepareS3Template() {
        /*
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
        }
        */
    }

    uploadDeploymentFiles() {
        console.log(`uploading to ${this.deploymentBucketName}`);
        var awsS3Client = new aws.S3();

        var s3Client = s3.createClient({ s3Client: awsS3Client });

        return send( () => awsS3Client.createBucket({
            Bucket: this.deploymentBucketName,
            CreateBucketConfiguration: {
                LocationConstraint: this.region
            }
        }))
        .catch( () => console.log(`Bucket creation failed`) )
        .then( () => new Promise<void>((resolve, reject) => {
            let progressBar = undefined;
            let lastAmount = 0;
            let uploader = s3Client.uploadDir({
                localDir: `${this.project.deploymentDir}`,
                s3Params: {
                    Bucket: this.deploymentBucketName,
                    Prefix: `${this.deployHash}/`,
                },
            })
            .on('progress', function() {
                if(uploader == undefined || uploader.progressTotal == 0)
                    return;

                if( progressBar === undefined )
                    progressBar = new ProgressBar('Syncing deployment bucket [:bar] :percent :etas', {
                            incomplete: chalk.grey('\u2588'),
                            complete: chalk.white('\u2588'),
                            total: uploader.progressTotal,
                            width: process.stdout['columns'] | 40,
                    });

                progressBar.tick(uploader.progressAmount - lastAmount);
                lastAmount = uploader.progressAmount;
            })
            .on('end', function() {
                resolve()
            })
            .on('error', function(err) {
                reject(err);
            });
        }));
    }



}
