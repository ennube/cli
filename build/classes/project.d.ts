/// <reference types="core-js" />
import * as classes from '../classes';
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
    serviceModules: {
        [name: string]: string;
    };
    constructor(directory: string);
    readonly buildDir: string;
    readonly mainModuleFileName: string;
    ensureLoaded(): void;
    private _builder;
    readonly builder: classes.Builder;
    discoverServices(): void;
}
