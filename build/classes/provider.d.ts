import { Project } from './project';
export declare abstract class Provider {
    constructor(project: Project);
    setGateway(gatewayName: string): void;
}
