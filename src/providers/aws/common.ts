import {pascalCase, paramCase} from 'change-case';


export namespace fn {

    export function ref(id:string) {
        return { Ref: id };
    }

    export function getAtt(targetId:string, attr:string){
        return { "Fn::GetAtt": [targetId, attr] };
    }

    export function join(delimitier: string, ...params: any[]){
        return { "Fn::Join": [delimitier, params] };
    }

}

class Stack {

    resources: {
        [typeName:string]: Resource[]
    } = { };

    constructor(public region:string, public stage:string) {
    }


    get template() {
        return {

        };
    }

    // resources
    // by class
    // by id
}

abstract class Resource {
    constructor(public stack: Stack) {
        //stack.resources[this.id] = this;
        //stack.resources[typeOf(this)] = {}
    }

    abstract get id(): string;
    abstract get type(): string;
    abstract get metadata(): any;
    abstract get dependsOn(): any;
    abstract get properties(): any;

    get ref() {
        return { 'Ref': this.id };
    }

    getAtt(att:string) {
        return { 'Fn::getAtt': [this.id, att] };
    }

}
