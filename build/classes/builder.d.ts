import { Project } from './project';
export declare class Builder {
    project: Project;
    constructor(project: Project);
    build(args: any): void;
}
