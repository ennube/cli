/// <reference types="core-js" />
import { Project, Provider } from '../../classes';
import { S3 } from './s3';
import { Gateway } from './gateway';
import { Lambda } from './lambda';
export declare class Amazon extends Provider implements Gateway, S3, Lambda {
    project: Project;
    stage: string;
    debug: boolean;
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
    createStackTemplate: string;
    updateStackTemplate: string;
    constructor(project: Project, stage?: string);
    prepared: Boolean;
    ensurePrepared(): void;
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
    ensure(): Promise<any>;
    update(): Promise<{}>;
    send(method: string, ...params: any[]): Promise<{}>;
}
