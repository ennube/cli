/// <reference types="core-js" />
export declare class Project {
    directory: string;
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
        };
    };
    constructor(directory: string);
    readonly buildDir: string;
    readonly mainModuleFileName: string;
    ensureLoaded(): any;
}
