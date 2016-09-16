/// <reference types="core-js" />
export declare class Project {
    directory: string;
    npmFileName: string;
    tscFileName: string;
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
    mainModule: Object;
    constructor(directory: string);
    readonly mainModuleFileName: string;
    loadMainModule(): any;
    readonly isLoaded: boolean;
}
