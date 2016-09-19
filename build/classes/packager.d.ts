/// <reference types="core-js" />
import { Project } from './project';
export declare class Packager {
    project: Project;
    constructor(project: Project);
    packup(args: any): void;
    webpackServices(): Promise<{}>;
    zip(): Promise<any[]>;
}
