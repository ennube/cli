/// <reference types="lodash" />
import { Project } from '../../project';
import * as _ from 'lodash';
export declare namespace fn {
    function ref(id: string): {
        Ref: string;
    };
    function getAtt(targetId: string, attr: string): {
        "Fn::GetAtt": string[];
    };
    function join(delimitier: string, ...params: any[]): {
        "Fn::Join": (string | any[])[];
    };
}
export interface StackParams {
    region?: string;
    stage?: string;
    deploymentBucket: string;
    deploymentPrefix: string;
}
export declare class Stack {
    project: Project;
    region: string;
    stage: string;
    deploymentBucket: string;
    deploymentPrefix: string;
    resourceList: Resource[];
    constructor(project: Project, params: StackParams);
    readonly name: string;
    readonly template: {
        AWSTemplateFormatVersion: string;
        Metadata: {};
        Parameters: {};
        Mappings: {};
        Conditions: {};
        Resources: _.Dictionary<any>;
        Outputs: {};
    };
    add(item: Resource): void;
}
export declare abstract class Resource {
    stack: Stack;
    constructor(stack: Stack);
    dependsOn: Resource[];
    metadata: any;
    readonly abstract id: string;
    readonly abstract type: string;
    readonly abstract properties: any;
    readonly ref: any;
    getAtt(att: string): {
        'Fn::GetAtt': string[];
    };
}
