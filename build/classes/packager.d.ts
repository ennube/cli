/// <reference types="core-js" />
import { Project } from './project';
export declare class Packager {
    project: Project;
    constructor(project: Project);
    packup(args?: any): Promise<any[]>;
    packupProjectSergments(): Promise<{}>;
    zip(): Promise<any[]>;
}
