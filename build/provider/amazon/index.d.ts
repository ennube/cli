/// <reference types="core-js" />
import { Project, Provider } from '../../classes';
import { S3 } from './s3';
import { Gateway } from './gateway';
import { Lambda } from './lambda';
export declare class Amazon extends Provider implements Gateway, S3, Lambda {
    project: Project;
    stage: string;
    region: string;
    client: any;
    Template: Object;
    Metadata: Object;
    Parameters: Object;
    Mappings: Object;
    Conditions: Object;
    Resources: {
        [resourceId: string]: {
            Type: string;
            Properties: Object;
        };
    };
    Outputs: Object;
    constructor(project: Project);
    prepareTemplate(): void;
    prepareS3Template: () => void;
    uploadDeploymentFiles: () => Promise<void>;
    prepareGatewayTemplate: () => void;
    prepareGatewayIntegrationTemplate: () => void;
    prepareGatewayMOCKTemplate: () => void;
    prepareGatewayHTTPTemplate: () => void;
    prepareGatewayLambdaTemplate: () => void;
    prepareLambdaTemplate: () => void;
    upload(args: any): Promise<void>;
    validate(args: any): void;
    describe(args: any): void;
    create(args: any): void;
    send(method: string, params: Object): Promise<{}>;
}
