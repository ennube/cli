/// <reference types="core-js" />
import { Resource } from './common';
import { Model } from '@ennube/sdk';
export declare class Template extends Model {
    formatVersion?: string;
    description?: string;
    metadata?: any;
    parameters?: {
        [parameterId: string]: Object;
    };
    mappings?: {
        [mappingId: string]: Object;
    };
    conditions?: {
        [conditionId: string]: Object;
    };
    resources: {
        [resourceId: string]: Resource;
    };
    outputs?: {
        [outputId: string]: Object;
    };
}
