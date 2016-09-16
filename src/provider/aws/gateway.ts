import {Resource} from './common';
import {Schema} from '@ennube/sdk';

@Schema.model()
export class Gateway extends Resource {
    static type = 'AWS::ApiGateway::RestApi';

    @Schema.field({ key: "name" })
    name: string;
}

@Schema.model()
export class Stage extends Resource {
    static type = 'AWS::ApiGateway::Stage';
}

@Schema.model()
export class URLEntry extends Resource {
    static type = 'AWS::ApiGateway::Resource';

    parent: URLEntry; // se resuelve como {"Fn::GetAtt": []}
    gateway: Gateway; // se resuelve como id, formato string...
    pathPart: string;

}
