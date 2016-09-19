/// <reference types="core-js" />
import { Project } from '../../classes';
export declare class S3 {
    stage: string;
    region: string;
    project: Project;
    Resources: Object;
    prepareS3Template(): void;
    uploadDeploymentFiles(): Promise<void>;
}
