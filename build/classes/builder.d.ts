/// <reference types="core-js" />
import { Project, TemplateCollection } from './project';
export declare class Builder {
    project: Project;
    constructor(project: Project);
    build(): Promise<{}>;
    buildTemplates(): Promise<{}>;
    collectTemplates(directory: string, collection: TemplateCollection): Promise<{}>;
}
