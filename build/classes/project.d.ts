/// <reference types="core-js" />
export declare type TemplateCollection = {
    [mimeType: string]: {
        [templateId: string]: string;
    };
};
export declare class Project {
    directory: string;
    deployHash: string;
    npmFileName: string;
    tscFileName: string;
    mainModule: Object;
    npm: {
        name: string;
        version: string;
        main: string;
    };
    tsc: {
        compilerOptions: {
            outDir: string;
            module: string;
        };
    };
    serviceModules: {
        [name: string]: string;
    };
    templates: {
        request: TemplateCollection;
        response: TemplateCollection;
    };
    constructor(directory: string);
    readonly name: string;
    readonly mainModuleFileName: string;
    readonly outDir: string;
    readonly buildDir: string;
    readonly packingDir: string;
    readonly deploymentDir: string;
    ensureLoaded(): void;
    discoverServices(): void;
}
