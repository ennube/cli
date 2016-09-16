/// <reference types="core-js" />
export declare function readJsonSync(filename: string): any;
export declare function writeJsonSync(filename: string, data: any): void;
export declare function readYamlSync(filename: string): any;
export declare function writeYamlSync(filename: string, data: any): void;
export declare function zipDirectory(directory: string, output?: string): Promise<{}>;
