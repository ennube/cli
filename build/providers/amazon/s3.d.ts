/// <reference types="core-js" />
import { Project } from '../../classes';
import { storage } from '@ennube/runtime';
export declare function getS3BucketId(project: Project, bucket: storage.Bucket, stage: string): string;
export declare function getS3BucketName(project: Project, bucket: storage.Bucket, stage: string): string;
export declare class S3 {
    stage: string;
    region: string;
    project: Project;
    Resources: Object;
    prepareS3Template(): void;
    uploadDeploymentFiles(): Promise<void>;
}
