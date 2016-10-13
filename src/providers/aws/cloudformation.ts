import {Project} from '../../project';
import {send} from './common';
import {pascalCase, paramCase} from 'change-case';
import * as _ from 'lodash';

const aws = require('aws-sdk');


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
    capabilities: string[] = ['CAPABILITY_IAM', 'CAPABILITY_NAMED_IAM'];

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


    update(onFailure:string='ROLLBACK') {
        let cf = new aws.CloudFormation({ region: this.region });

        return new Promise((resolve, reject) => {
            send( () => cf.describeStacks({ StackName: this.name }))
            .then((x) => resolve(true))
            .catch((x) => x.message.endsWith('does not exist')?
                resolve(false):
                reject(x))
        })

        .then( (exists) => exists? {
            name: 'Updating stack',
            method: 'updateStack',
            successState: 'stackUpdateComplete'
        }: {
            name: 'Creating stack',
            method: 'createStack',
            successState: 'stackCreateComplete'
        })

        // Send update task
        .then( (task) => {
            console.log(task.name);
            return task;
        } )

        .then( (task) =>
            send( () => cf[task.method]({
                StackName: this.name,
                TemplateBody: JSON.stringify(this.template),
                Capabilities: this.capabilities,
//                OnFailure: onFailure
            } ))
            .then( () => task )
        )

        .then( (task) => send( () =>
            cf.waitFor(task.successState, {
                StackName: this.name
            })
        ))

        //.then( () => resolve() )
        //.catch( (x) => reject(x) )
        //return this;
    }
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
