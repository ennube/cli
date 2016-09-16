import {Resource} from './common';
import {Schema} from '@ennube/sdk';


@Schema.model()
export class S3Bucket extends Resource {
    static type = 'AWS::S3::Bucket';
}
