/// <reference types="core-js" />
import { Project } from '../../project';
export declare function getLambdaId(serviceName: string, stage: string): string;
export declare class Lambda {
    region: string;
    stage: string;
    project: Project;
    deploymentBucketName: string;
    deployHash: string;
    Resources: {
        [resourceId: string]: {
            Type: string;
            Properties: Object;
        };
    };
    prepareLambdaTemplate(): void;
}
