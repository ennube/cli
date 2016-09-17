/// <reference types="core-js" />
/// <reference types="node" />
import { Project } from './project';
export declare class Builder {
    project: Project;
    constructor(project: Project);
    build(): Promise<{}>;
    replicatesModularStructure(module: NodeModule, packingDir: string): void;
    packing(): Promise<{}>;
    runBuild(args: any): void;
}
