/// <reference types="core-js" />
import { Project } from '../../classes';
export declare class Amazon {
    project: Project;
    client: any;
    Template: Object;
    Metadata: Object;
    Parameters: Object;
    Mappings: Object;
    Conditions: Object;
    Resources: Object;
    Outputs: Object;
    constructor(project: Project);
    buildGateway(): void;
    ensureGateway(gateway: any): void;
    ensureGatewayUrl(gateway: string, url: string): any;
    createGatewayUrlMethod(gateway: any, resourceId: string, method: string, lambdaId: string): void;
    validate(args: any): void;
    create(args: any): void;
    send(method: string, params: Object): Promise<{}>;
}
