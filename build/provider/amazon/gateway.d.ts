/// <reference types="core-js" />
import { Project } from '../../classes';
export declare class Gateway {
    project: Project;
    Resources: {
        [resourceId: string]: {
            Type: string;
            Properties: Object;
        };
    };
    prepareGatewayTemplate(): void;
    prepareGatewayMOCKTemplate(): void;
    prepareGatewayLambdaTemplate(): void;
    prepareGatewayHTTPTemplate(): void;
}
