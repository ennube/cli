/// <reference types="core-js" />
import { Shell, Manager } from './shell';
import { Project } from './project';
export declare class Builder implements Manager {
    shell: Shell;
    constructor(shell: Shell);
    build(shell: Shell, project: Project): Promise<any[]>;
}
