/// <reference types="core-js" />
import { Shell } from './shell';
import { Project } from './project';
import { Builder } from './builder';
export declare abstract class Provider {
    shell: Shell;
    constructor(shell: Shell);
    deploy(shell: Shell, project: Project, builder: Builder): Promise<{}>;
}
