/// <reference types="yargs" />
import { Project } from './project';
import * as yargs from 'yargs';
export interface ICommandServiceClass {
    new (project: Project): CommandService;
}
export declare abstract class CommandService {
    project: Project;
    constructor(project: Project);
}
export declare const allCommands: {
    [command: string]: {
        serviceClass: ICommandServiceClass;
        description: string;
        builder: {
            [optionName: string]: yargs.Options;
        };
    };
};
export declare function command(description?: string, builder?: any): (servicePrototype: any, commandName: string, descriptor: PropertyDescriptor) => void;
export declare class Shell implements CommandService {
    project: Project;
    constructor(project: Project);
    private commandServices;
    getCommandService(serviceClass: ICommandServiceClass): CommandService;
    run(): any;
}
