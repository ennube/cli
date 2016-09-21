import {pascalCase, paramCase} from 'change-case';

//import * as aws from 'aws-sdk';

// common
export function getStackName(projectName: string, stage: string) {
    return `${pascalCase(projectName)}-${pascalCase(stage)}`;
}

export function ref(id:string) {
    return { Ref: id };
}

export function getAtt(id:string, attr:string){
    return { "Fn::GetAtt": [id, attr] };
}

export function fnJoin(...params: any[]){
    return { "Fn::Join": params };
}


export function mixin(...baseClasses) {
    return (targetClass: Function) => {
        for(let baseClass of baseClasses) {
            for(let property of Object.getOwnPropertyNames(baseClass.prototype)) {
                targetClass.prototype[property] = baseClass.prototype[property];
            }
        }
    }
}

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
    constructor(public stack: Stack, public parent: Resource) {
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

export function send(request: (()=>any)) {
    return new Promise((resolve, reject) => {
        request()
        .on('success', (response) => resolve(response) )
        .on('error', (response) => reject(response) )
        .send();
    });
}
