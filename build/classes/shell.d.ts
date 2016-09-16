/// <reference types="yargs" />
import * as yargs from 'yargs';
import { Project } from './project';
export interface ICommandServiceConstructor {
    new (project: Project): ICommandService;
}
export interface ICommandService {
}
export declare class Shell implements ICommandService {
    project: Project;
    static commands: {
        [command: string]: {
            constructor: ICommandServiceConstructor;
            methodName: string;
            descriptor: PropertyDescriptor;
            description: string;
            builder: {
                [optionName: string]: yargs.Options;
            };
        };
    };
    static command(command: string, description?: string, builder?: {
        [optionName: string]: yargs.Options;
    }): (prototype: any, methodName: string, descriptor: PropertyDescriptor) => void;
    private commandServices;
    constructor(project: Project);
    run(): any;
}
