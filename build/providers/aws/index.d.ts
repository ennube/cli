/// <reference types="core-js" />
import { Shell, Manager } from '../../shell';
import { Project } from '../../project';
import { Builder } from '../../builder';
import { Stack } from './cloudformation';
export declare class AWS implements Manager {
    shell: Shell;
    project: Project;
    constructor(shell: Shell, project: Project);
    deploy(shell: Shell, project: Project, builder: Builder): Promise<{}>;
    createStack(project: Project): Stack;
}
