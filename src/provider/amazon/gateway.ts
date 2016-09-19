import {Project} from '../../classes';
import {http} from '@ennube/runtime';
import {ref, getAtt} from './common';
import {pascalCase} from 'change-case';
import * as _ from 'lodash';

function getGatewayId(gateway:string) {
    return `Gateway${pascalCase(gateway)}`;
}

function getGatewayUrlId(gateway:string, parts:string[]) {
    return getGatewayId(gateway) + `URL` +
        parts.map( (v) => pascalCase(_.trim(v, '{}')) ).join('SLASH') ;
}

function getGatewayUrlMethodId(gateway:string, parts:string[], method: string) {
    return getGatewayUrlId(gateway, parts) + method.toUpperCase();
}

type GatewayIteratorCB = (gateway:string, method:string, url: string, endpoint: http.Endpoint) => void;

function gatewayIterator( callback: GatewayIteratorCB ) {
    for( let gatewayId in http.allGateways ) {
        let gateway = http.allGateways[gatewayId];
        for( let url in gateway.endpoints ) {
            let urlMethods = gateway.endpoints[url];
            for( let method in urlMethods )
                callback(gatewayId, url, method, urlMethods[method]);
        }
    }
}


export class Gateway {

    project: Project;

    Resources: {
        [resourceId:string]: {
            Type: string,
            Properties: Object
        }
    };

    prepareGatewayTemplate() {
        gatewayIterator((gateway, url, method, endpoint) => {
            url = _.trim(url, '/');

            // Ensure gateway
            let gatewayId = getGatewayId(gateway);
            if( !(gatewayId in this.Resources) )
                this.Resources[gatewayId] = {
                    Type: 'AWS::ApiGateway::RestApi',
                    Properties: {
                        Name: `${this.project.npm.name}-${gateway}`
                    }
                }
            // Ensure URL RESOURCE
            let urlParts = [];
            let urlArgs = [];
            let parentResourceId;

            if(!!url)
            for(let urlPart of url.split('/')) {
/*
                let argMatch = /\{([\-\w]+)\}/.exec(urlPart);
                if( argMatch ) {
                    urlPart = `{ARG${urlArgs.length}}`;
                    urlArgs.push(argMatch[1]);
                }
*/
                urlParts.push(urlPart)
                let resourceId = getGatewayUrlId(gateway, urlParts);

                if( !(resourceId in this.Resources) )
                    this.Resources[resourceId] = {
                        Type: 'AWS::ApiGateway::Resource',
                        Properties: {
                            RestApiId: ref(gatewayId),
                            ParentId: parentResourceId?
                                ref(parentResourceId):
                                getAtt(gatewayId, 'RootResourceId'),
                            PathPart: urlPart
                        }
                    }
                parentResourceId = resourceId;
            }

            // CREATE METHOD
            let methodId = getGatewayUrlMethodId(gateway, urlParts, method);

            this.Resources[methodId] = {
                Type: 'AWS::ApiGateway::Method',
                Properties: {
                    RestApiId: ref(gatewayId),
                    ResourceId: parentResourceId?
                        ref(parentResourceId):
                        getAtt(gatewayId, 'RootResourceId'),
                    HttpMethod: method.toUpperCase(),
                    AuthorizationType: 'NONE',
    //                AuthorizerId:
                    RequestParameters: {},
                    Integration: {
                        Type: 'MOCK',
                        IntegrationHttpMethod: method.toUpperCase(),
                    },
                }
            }

        });
    }

    prepareGatewayMOCKTemplate() {

    }

    prepareGatewayLambdaTemplate() {

    }

    prepareGatewayHTTPTemplate() {

    }
}
