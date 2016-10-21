import {Shell, Manager, manager, command} from './shell';
import {Builder} from './builder';
//import {allServiceDescriptors, mainEntry} from '@ennube/runtime';
import * as nodeHttp from 'http';
import {http, mainEntry} from '@ennube/runtime';

import * as _ from 'lodash';



@manager()
export class Server implements Manager {

//    server: nodeHttp.Server;


    @command('serve')
    serve(builder: Builder) {
        let port = 4000;
        return builder.build()
        .then(() => {
            this.buildMatchers();

            nodeHttp.createServer((req, res) => this.requestHandler(req, res))
                .listen(port, () => {
                    console.log(`Server listening on: http://localhost:${port}`);
                });
        })
    }


    matchers: ((httpEvent: http.RequestData) => boolean)[] = [];


    private buildMatchers() {
        for(let gatewayName in http.allGateways) {
            let gateway = http.allGateways[gatewayName];
            for(let resource in gateway.endpoints)
                this.matchers.push(this.buildMatcher(gatewayName, resource));
        }
    }

    private buildMatcher(gateway, resource) {

        let parts: string[] = [];
        let params: string[] = [];

        for(let part of _.trim(resource, '/').split('/')) {
            let match = /\{([\-\w]+)\}/.exec(part);
            if( match ) {
                params.push(match[1]);
                parts.push('([_\\w\\-]*)');
                continue;
            }
            match = /\{([\-\w]+)\+\}/.exec(part);
            if( match ) {
                params.push(match[1]);
                parts.push('(.*)');
                break;
            }
            parts.push(part);
        }

        let pattern = new RegExp(parts.join('\\/'));
        return (httpEvent: http.RequestData) => {
            let match = pattern.exec(_.trim(httpEvent.path, '/'));
            if( match ) {
                console.log('MATCHED URL', match, pattern);
                httpEvent.resource = resource;
                httpEvent.stageVariables['gatewayName'] = gateway;
                for(let n in params)
                    httpEvent.pathParameters[params[n]] = match[Number(n)+1];
                console.log(httpEvent);
                return true;
            }
            return false;
        };
    }

    requestHandler(request, response) {

        console.log(request.method, request.url);

        let httpEvent = {
            httpMethod: request.method,
            resource: '',
            path: request.url,
            pathParameters: {},
            queryStringParameters: {},
            headers: {},
            stageVariables: {

            },
            //requestContext: {},
            body: ''
        };

        let context = {

        };

        for(let matcher of this.matchers)
            if(matcher(httpEvent)) {
                mainEntry(httpEvent, context, (error:Error, success: http.ResponseData) => {
                    if( error === null ) {
                        response.writeHead(success.statusCode, success.headers);
                        response.end(success.body);
                    }

                    else
                        throw error;
                });
                return;
            }

        response.writeHead(404);
        response.end();
    }
}
