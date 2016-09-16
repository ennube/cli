import * as fs from 'fs-extra';
import * as yargs from 'yargs'
import * as _ from 'lodash'

import {Project} from './project';

export interface ICommandServiceConstructor {
    /*
    abstract help()  ??
    */
    new (project: Project): ICommandService;
}

export interface ICommandService {

}

export class Shell implements ICommandService {

    static commands : { [command:string]: {
        constructor: ICommandServiceConstructor,
        methodName: string,
        descriptor: PropertyDescriptor,
        description: string,
        builder: { [optionName:string]: yargs.Options },
    }} = {};


    static command(command: string, description?:string, builder?: { [optionName:string]: yargs.Options }) {
        return (prototype, methodName: string, descriptor: PropertyDescriptor) => {
            Shell.commands[command] = {
                 constructor: prototype.constructor,
                 methodName, descriptor, description, builder
             };
        };
    }

    private commandServices: Map<any, Object>;

    constructor(public project: Project) {
        this.commandServices = new Map;
        this.commandServices.set(Shell, this);
    }

    run() {
        let shell = this;
        yargs.usage('$0 <command>');

        let mainModule = require(this.project.mainModuleFileName);

        _.forOwn(Shell.commands, (info, command) => {
            yargs.command(
                command,
                info.description,
                info.builder,
                (args) => {
                    //console.log(`invoke ${command}`);
                    //console.dir(info);
                    var commandService;

                    if(this.commandServices.has(info.constructor))
                        commandService = this.commandServices.get(info.constructor);
                    else {
                        commandService = new info.constructor(this.project);
                    }

                    // execute command
                    try{
                        let result = commandService[info.methodName](args);
                    }
                    catch(e) {
                        console.log(e);
                    }
/*
                    if(result instanceof Promise) result
                        .then()
                        .catch()
*/
                }
            );
        });


        return yargs.help().argv;
    }


};
