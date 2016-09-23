/// <reference types="core-js" />
import { Shell, Manager } from './shell';
import { Project } from './project';
export declare class Builder implements Manager {
    shell: Shell;
    project: Project;
    constructor(shell: Shell, project: Project);
    build(): Promise<any[]>;
    runTsc(): Promise<{}>;
    compileTemplates(): Promise<{}>;
    executeWebpack(): Promise<{}>;
    archiveServices(): Promise<any[]>;
}
