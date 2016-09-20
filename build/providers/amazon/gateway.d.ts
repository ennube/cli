import { Project } from '../../classes';
import { http } from '@ennube/runtime';
export declare class Gateway {
    project: Project;
    stage: string;
    Resources: {
        [resourceId: string]: {
            Type: string;
            Properties: any;
        };
    };
    prepareGatewayTemplate(): void;
    prepareGatewayIntegrationTemplate(): void;
    prepareGatewayLambdaTemplate(integration: any, endpoint: http.Endpoint): void;
    prepareGatewayMOCKTemplate(): void;
    prepareGatewayHTTPTemplate(): void;
}
