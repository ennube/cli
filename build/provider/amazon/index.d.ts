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
    validate(args: any): void;
    create(args: any): void;
    send(method: string, params: Object): Promise<{}>;
}
