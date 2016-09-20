/// <reference types="core-js" />
import { Project } from '../../classes';
export declare function getLambdaId(serviceName: string, stage: string): string;
export declare class Lambda {
    region: string;
    stage: string;
    project: Project;
    Resources: {
        [resourceId: string]: {
            Type: string;
            Properties: Object;
        };
    };
    prepareLambdaTemplate(): void;
}
