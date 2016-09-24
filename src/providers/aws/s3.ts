import {send} from './common';

import * as _ from 'lodash';
import * as ProgressBar from 'progress';
import * as chalk from 'chalk';


const aws = require('aws-sdk');
const s3 = require('s3');


// s3.ts

interface AWSListBucketsResult {
    Buckets: [{
        Name: string,
        CreationDate: Date
    }];
    Owner: {
        DisplayName: string,
        ID: string
    };
}

export interface ListBucketsResult {
    [ bucketName:string ]: {
        creationDate: Date,
        ownerId: string,
        ownerName: string
    }
}

// Returns a { [bucketName]: Date  relation of buckets }
export function listBuckets(): Promise<ListBucketsResult> {
    var s3 = new aws.S3();
    return send( () => s3.listBuckets())
    .then( (x) => {console.log(x); return x} )

    .then( (result: AWSListBucketsResult) => _.fromPairs(
        result.Buckets.map( (item) => [item.Name,{
            creationDate: item.CreationDate,
            ownerId: result.Owner.ID,
            ownerName: result.Owner.DisplayName
        }]))
    )
}



export interface SyncBucketParams {
    sourceDirectory: string;
    defaultRegion:string;
    bucketName:string;
    destinationDirectory: string;
    createFirst: boolean;
//    removeIfNotExists: boolean;
};


export function syncBucket(params: SyncBucketParams) {

    console.log(`Syncinc ${params.sourceDirectory} ←→` +
                `s3://${params.bucketName}/${params.destinationDirectory}`);

    var awsS3Client = new aws.S3();
    var s3Client = s3.createClient({ s3Client: awsS3Client });


    let promise = Promise.resolve();

    if(params.createFirst) {
        //console.log(`creating bucket`);
        promise.then( () => send( () => awsS3Client.createBucket({
            Bucket: params.bucketName,
            CreateBucketConfiguration: {
                LocationConstraint: params.defaultRegion
            }
        })))
        .catch( () => console.log(`Bucket creation failed`) )
    }

    promise.then( () => new Promise((resolve, reject) => {
        let progressBar = undefined;
        let lastAmount = 0;
        let task = s3Client.uploadDir({
            localDir: params.sourceDirectory,
            s3Params: {
                Bucket: params.bucketName,
                Prefix: params.destinationDirectory?
                    `${params.destinationDirectory}/`: ''
            },
        })
        .on('progress', function() {
            if(task == undefined || task.progressTotal == 0)
                return;

            if( progressBar === undefined )
                progressBar = new ProgressBar('[:bar] :percent :etas', {
                        incomplete: chalk.grey('\u2588'),
                        complete: chalk.white('\u2588'),
                        total: task.progressTotal,
                        width: process.stdout['columns'] | 40,
                });

            progressBar.tick(task.progressAmount - lastAmount);
            lastAmount = task.progressAmount;
        })
        .on('end', function() {
            resolve( )
        })
        .on('error', function(err) {
            reject( err );
        });
    }));

    return promise;

}
