import {Project} from '../../project';
import {http} from '@ennube/runtime';
import {fn} from './common';
import {getLambdaId} from './lambda';
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



    // GET defaults to 200
    // POST defaults to 201 created
    // PUT defaults to 204 with location
    // DELETE defaults to 204 with location

    // add 300 responses
        // solo puede tener una respuesta redirect..

    // add 4xx responses
    // add 5xx responses

    // 201 CREATED, should include a location header.

function methodResponse(statusCode: Number) {
    let responseModels = {
        'text/html': 'Empty',
        'application/json': 'Empty',
    };

    let responseParameters = {
        'method.response.header.location': false,
    };

    if( statusCode >= 300 && statusCode < 400 ) // redirections
        Object.assign(responseParameters, {
            'method.response.header.location': true,
        });

    return {
        StatusCode : statusCode,
        ResponseModels : responseModels,
        ResponseParameters : responseParameters
    };
}
function integrationResponse(statusCode:Number) {

    let selectionPattern = undefined;
    let responseParameters = {}
    let responseTemplates = {};

    if( statusCode == 200 ) {
        responseTemplates = {
            'text/http': `#set($inputRoot = $input.path('$'))\n$inputRoot.content`,
            'application/json': `#set($inputRoot = $input.path('$'))\n$inputRoot.content`,
        }
    }
    else if( statusCode >= 300 && statusCode < 400 ) {
        selectionPattern = 'http.*';
        Object.assign(responseParameters, {
            'method.response.header.location' : "integration.response.body.errorMessage",
        });

        Object.assign(responseTemplates, {
            'text/html' : "",
            'application/json' : "",
        });
    }
    else if( statusCode >= 400 && statusCode <= 500 ) {
        selectionPattern = `\\[${statusCode}.*`;
        responseTemplates = {
            'text/http': `#set($_body = $util.parseJson($input.path('$.errorMessage'))[1])\n$_body.content`,
            'application/json': `#set($_body = $util.parseJson($input.path('$.errorMessage'))[1])\n$_body.content`,
        }
    }

    return {
        StatusCode: statusCode,
        SelectionPattern: selectionPattern,
        ResponseParameters: responseParameters,
        ResponseTemplates: responseTemplates,
    };
}

export class Gateway {

    project: Project;
    stage: string;

    Resources: {
        [resourceId:string]: {
            Type: string,
            Properties: any,
            Metadata?: any,
            DependsOn?: any,
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
            let requestParameters = {};
            let urlParts = [];
            let urlArgs = [];
            let parentResourceId;

            if(!!url)
            for(let urlPart of url.split('/')) {

                let argMatch = /\{([\-\w]+)\}/.exec(urlPart);
                if( argMatch ) {
                    requestParameters[`method.request.path.${argMatch[1]}`] = true;
                }

                urlParts.push(urlPart)
                let resourceId = getGatewayUrlId(gateway, urlParts);

                if( !(resourceId in this.Resources) )
                    this.Resources[resourceId] = {
                        Type: 'AWS::ApiGateway::Resource',
                        Properties: {
                            RestApiId: fn.ref(gatewayId),
                            ParentId: parentResourceId?
                                fn.ref(parentResourceId):
                                fn.getAtt(gatewayId, 'RootResourceId'),
                            PathPart: urlPart
                        }
                    }
                parentResourceId = resourceId;
            }

            // CREATE METHOD
            let methodId = getGatewayUrlMethodId(gateway, urlParts, method);



            //[200, 201, 301, 400, 401, 403, 404, 500]
            this.Resources[methodId] = {
                Type: 'AWS::ApiGateway::Method',
                Properties: {
                    RestApiId: fn.ref(gatewayId),
                    ResourceId: parentResourceId?
                        fn.ref(parentResourceId):
                        fn.getAtt(gatewayId, 'RootResourceId'),
                    HttpMethod: method.toUpperCase(),
                    AuthorizationType: 'NONE',
    //                AuthorizerId:
                    RequestParameters: requestParameters,
                    Integration: {
                        Type: 'MOCK',
                        IntegrationHttpMethod: method.toUpperCase(),
                        IntegrationResponses: [
                            integrationResponse(200),
                            integrationResponse(301),
                            integrationResponse(400),
                            integrationResponse(401),
                            integrationResponse(403),
                            integrationResponse(404),
                            integrationResponse(500),
                        ]
                    },
                    MethodResponses: [
                        methodResponse(200),
                        methodResponse(301),
                        methodResponse(400),
                        methodResponse(401),
                        methodResponse(403),
                        methodResponse(404),
                        methodResponse(500),
                    ],
                    //PassthroughBehavior: 'Never'
                }
            }


        });
    }

    prepareGatewayIntegrationTemplate() {
        let allMethodIds = [];
        gatewayIterator((gateway, url, method, endpoint) => {

            let methodId = getGatewayUrlMethodId(gateway,
                _.trim(url, '/').split('/'), method);

            let resource = this.Resources[methodId];

            // switch to interation type..
            this.prepareGatewayLambdaTemplate(
                resource.Properties.Integration,
                endpoint
            );

            allMethodIds.push(methodId);
        });

        ///

        for( let gateway in http.allGateways ) {
            let gatewayId = getGatewayId(gateway);
            let deploymentId = `${gatewayId}${pascalCase(this.stage)}Deployment`;
            let stageId = `${gatewayId}${pascalCase(this.stage)}Stage`;

            this.Resources[deploymentId] = {
                Type: 'AWS::ApiGateway::Deployment',
                DependsOn: allMethodIds,
                Properties: {
                    RestApiId: fn.ref(gatewayId),
                    StageName: `${pascalCase(this.stage)}`,
                },
            };
/*
            this.Resources[stageId] = {
                Type: 'AWS::ApiGateway::Stage',
                Properties: {
                    RestApiId: fn.ref(gatewayId),
                    DeploymentId: fn.ref(deploymentId),
                    StageName: pascalCase(this.stage),
                },
            };
*/

        }

    }

    prepareGatewayLambdaTemplate(integration: any, endpoint: http.Endpoint) {
        integration.Type = 'AWS';
        integration.IntegrationHttpMethod = 'POST';
        // TODO: Generar esto en lambda.ts
        integration.Uri = fn.join('',
            'arn:aws:apigateway:',
            fn.ref('AWS::Region'),
            ':lambda:path/2015-03-31/functions/',
            fn.getAtt(getLambdaId(endpoint.service.serviceClass.name, this.stage), 'Arn'),
            '/invocations'
        )

    }


    prepareGatewayMOCKTemplate() {

    }

    prepareGatewayHTTPTemplate() {

    }

}
/*
Protocolo de retorno,

*/
