import {Model, Schema, getTypeOf, schemas} from '@ennube/sdk';
import * as aws from 'aws-sdk';

@Schema.model()
export class Resource extends Model {
    static type: string;

    static polymorphicId() {
        return this.type;
    }

    polymorphicOutgoingFilter(Resource: Object): Object {
        return {
            Type: (<any>getTypeOf(this)).polymorphicId(),
            Resource
        };
    }

}
/*
    Tambien habra parametros, 
 */
