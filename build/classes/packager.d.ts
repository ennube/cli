import { Project } from './project';
export declare class Packager {
    project: Project;
    constructor(project: Project);
    modularStructureReplication(): void;
    packup(args: any): void;
}
