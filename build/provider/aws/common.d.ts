/// <reference types="core-js" />
import { Model } from '@ennube/sdk';
export declare class Resource extends Model {
    static type: string;
    static polymorphicId(): string;
    polymorphicOutgoingFilter(Resource: Object): Object;
}
