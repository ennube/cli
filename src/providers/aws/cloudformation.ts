import {Project} from '../../project';
import {pascalCase, paramCase} from 'change-case';
import * as _ from 'lodash';

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

export interface StackParams {
    region?:string;
    stage?:string;
    deploymentBucket:string;
    deploymentPrefix:string;
}

export class Stack {

    region: string = 'eu-west-1';
    stage: string = 'development';
    deploymentBucket: string;
    deploymentPrefix: string;
    resourceList: Resource[] = [];

/*
    resources: {
        [typeName:string]: Resource[]
    } = { };
*/
    constructor(public project: Project, params: StackParams) {
        Object.assign(this, params);
    }

    get name() {
        return `${pascalCase(this.project.name)}-${pascalCase(this.stage)}`;
    }

    get template() {
        return {
           AWSTemplateFormatVersion: "2010-09-09",
           Metadata: {},
           Parameters: {},
           Mappings: {},
           Conditions: {},
           Resources: _.fromPairs(this.resourceList.map((r) => [ r.id, {
               Type: r.type,
               Properties: r.properties,
               DependsOn: r.dependsOn? r.dependsOn.map( (r) => r.id ): undefined,
               Metadata: r.metadata
           }])),
           Outputs: {}
        };
    }


    add(item: Resource) {
        this.resourceList.push(item);
    }


    // resources
    // by class
    // by id
}


export abstract class Resource {
    constructor(public stack: Stack) {
        stack.add(this);
    }

    dependsOn: Resource[];
    metadata: any;

    abstract get id(): string;
    abstract get type(): string;
    abstract get properties(): any;



    get ref(): any {
        return { 'Ref': this.id };
    }

    getAtt(att:string) {
        return { 'Fn::GetAtt': [this.id, att] };
    }

}
