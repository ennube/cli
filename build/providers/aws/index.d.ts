/// <reference types="core-js" />
import { Shell, Manager } from '../../shell';
import { Project } from '../../project';
import { Builder } from '../../builder';
import { Stack } from './cloudformation';
export declare class Aws implements Manager {
    shell: Shell;
    constructor(shell: Shell);
    deploy(shell: Shell, project: Project, builder: Builder): Promise<{}>;
    reDeploy(shell: Shell, project: Project, builder: Builder): Promise<{}>;
    createStack(project: Project): Stack;
    uploadDeploymentFiles(stack: Stack): Promise<{}>;
    updateStack(stack: any): Promise<{}>;
}
