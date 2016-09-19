import * as fs from 'fs-extra';
import * as yargs from 'yargs'
import * as _ from 'lodash'

import {Project} from './project';
import {typeOf} from '@ennube/runtime';

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

        _.forOwn(Shell.commands, (info, command) => {
            yargs.command(
                command,
                info.description,
                info.builder,
                (args) => {

                    var commandService = this.commandServices.get(info.constructor);
                    if( commandService === undefined)
                        commandService = new info.constructor(this.project);

                    try {
                        let result = commandService[info.methodName](args);

                        

                        if(typeOf(result) === Promise) result
                            .then((x) => console.log('OK', x))
                            .catch((x) => console.log('ER', x));
                    }
                    catch(e) {
                        console.log(e);
                    }
                }
            );
        });

        yargs
        .fail((msg, ...err: any[]) => {
          if (err[0]) throw err[0] // preserve stack
          console.error(msg)
          process.exit(1)
        })

        return yargs.help().argv;
    }


};
