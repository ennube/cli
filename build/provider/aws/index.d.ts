/// <reference types="core-js" />
import * as _common from './common';
export declare const common: typeof _common;
import * as _cloudFormation from './cloudFormation';
export declare const cloudFormation: typeof _cloudFormation;
import * as _gateway from './gateway';
export declare const gateway: typeof _gateway;
import * as _lambda from './lambda';
export declare const lambda: typeof _lambda;
import * as _s3 from './s3';
export declare const s3: typeof _s3;
export declare class CloudFormationClient {
    client: any;
    constructor();
    validateTemplate(template: Object): Promise<{}>;
}
