import { Manager } from './shell';
import { Builder } from './builder';
import { http } from '@ennube/runtime';
export declare class Server implements Manager {
    serve(builder: Builder): Promise<void>;
    matchers: ((httpEvent: http.RequestData) => boolean)[];
    private buildMatchers();
    private buildMatcher(gateway, resource);
    requestHandler(request: any, response: any): void;
}
