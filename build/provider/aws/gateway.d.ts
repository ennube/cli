import { Resource } from './common';
export declare class Gateway extends Resource {
    static type: string;
    name: string;
}
export declare class Stage extends Resource {
    static type: string;
}
export declare class URLEntry extends Resource {
    static type: string;
    parent: URLEntry;
    gateway: Gateway;
    pathPart: string;
}
