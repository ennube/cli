import * as fs from 'fs-extra';
import * as yargs from 'yargs'
import * as _ from 'lodash'

import {Project} from './project';
import {typeOf} from '@ennube/runtime';

export interface ICommandServiceClass {
    new (project: Project): CommandService;
}

export abstract class CommandService {
    constructor(public project:Project) {
    }
}

export const allCommands: {
    [command:string]: {
        serviceClass: ICommandServiceClass,
//            commandName: string,
        description: string,
        builder: {
            [optionName:string]: yargs.Options
        },
    }
} = {};


export function command(description?:string, builder?) {
    return (servicePrototype, commandName: string, descriptor: PropertyDescriptor) => {

        if(typeof servicePrototype == 'function')
            throw new Error(`${servicePrototype.name}.${commandName}():` +
                            `static commands are not permitted`);

        allCommands[commandName] = {
             serviceClass: servicePrototype.constructor,
//                 commandName,
             description,
             builder
         };
    };
}


export class Shell implements CommandService {

    constructor(public project: Project) {
        this.commandServices.set(Shell, this);
    }

    private commandServices = new Map<ICommandServiceClass, CommandService>();

    getCommandService(serviceClass: ICommandServiceClass) {
        let commandService = this.commandServices.get(serviceClass);
        if( commandService === undefined)
            this.commandServices.set(serviceClass,
                commandService = new serviceClass(this.project));

        return commandService;
    }

    run() {
        let shell = this;
        yargs.usage('$0 <command>');

        _.forOwn(allCommands, (command, commandName) => {
            yargs.command(commandName, command.description, command.builder,
                (args) => {
                    var commandService = this.getCommandService(command.serviceClass)
                    Promise.resolve()
                    .then(() => commandService[commandName](args))
                    .catch((x) => console.error('ER', x));
                }
            );
        });

        return yargs.help().argv;
    }
/*
    @Shell.command('deploy')
    deploy(args) {
        let providerName = 'Amazon';


        this.project.builder.build()
        .then(() => this.project.packager.packup())
        .then(() => {
            let providerClass = require('../providers')[providerName];
            let provider = new providerClass(this.project);

//            provider.

        })
    }
*/
};
