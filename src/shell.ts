import {typeOf, Type} from './common';
import * as yargs from 'yargs'
//import * as _ from 'lodash'

const banner =
'                                                               \n' +
'        ███████╗███╗   ██╗███╗   ██╗██╗   ██╗██████╗ ███████╗  \n' +
'        ██╔════╝████╗  ██║████╗  ██║██║   ██║██╔══██╗██╔════╝  \n' +
'        █████╗  ██╔██╗ ██║██╔██╗ ██║██║   ██║██████╔╝█████╗    \n' +
'        ██╔══╝  ██║╚██╗██║██║╚██╗██║██║   ██║██╔══██╗██╔══╝    \n' +
'        ███████╗██║ ╚████║██║ ╚████║╚██████╔╝██████╔╝███████╗  \n' +
'        ╚══════╝╚═╝  ╚═══╝╚═╝  ╚═══╝ ╚═════╝ ╚═════╝ ╚══════╝  \n' +
'                                                               \n' ;


export interface ManagerClass extends Function {
    new(...params: Manager[]): Manager;
};

export interface Manager {

}

export const allManagers: {
    [managerName:string]: {
        managerClass: ManagerClass,
        paramTypes: ManagerClass[],
        commands: {
            [methodName:string]: {
                command: string,
                description?: string,
                builder?: any,
            }
        }
    }
} = {};


export function manager(...paramTypes: ManagerClass[]) {
    return (managerClass: ManagerClass) => {
        let managerEntry = allManagers[managerClass.name];
        if( managerEntry === undefined )
            managerEntry = allManagers[managerClass.name] = {
                managerClass,
                paramTypes,
                commands: {}
            };

        Object.assign(managerEntry, {
            paramTypes,
        });
    }
}

export function command(command:string, description?:string, builder?) {
    return (managerPrototype, methodName: string, descriptor: PropertyDescriptor) => {
        if(typeof managerPrototype == 'function')
            throw new Error(`${managerPrototype.name}.${methodName}():` +
                            `static commands are not permitted`);

        let managerClass = managerPrototype.constructor;

        let managerEntry = allManagers[managerClass.name];
        if( managerEntry === undefined )
            managerEntry = allManagers[managerClass.name] = {
                commands: { },
                paramTypes: [],
                managerClass
            };

        managerEntry.commands[methodName] = {
                command,
                description,
                builder
        };

    };
}


@manager()
export class Shell implements Manager {

    private allManagerInstances = new Map<ManagerClass, Manager>();

    constructor() {
        this.allManagerInstances.set(Shell, this);
    }

    getManagerInstance(managerClass: ManagerClass) {
        let manager = this.allManagerInstances.get(managerClass);
        if( manager === undefined ) {

            // creates a new manager, inject constructor types.
            let paramTypes = allManagers[managerClass.name].paramTypes;
            manager = new managerClass(...paramTypes.map(
                (T) => this.getManagerInstance(T)));

            this.allManagerInstances.set(managerClass, manager);
        }

        return manager;
    }

    get projectDir() {
        return process.cwd();
    }


    taskMessage: string;
    task(message:string) {
        this.taskMessage = message;
        console['_stdout'].write(`${message}`);
    }

    resolveTask(resolve, ...params: any[]) {
        this.taskMessage = undefined;
        console['_stdout'].write(`\tOK\n`);
        return resolve(...params);
    }

    rejectTask(reject, ...params: any[]) {
        this.taskMessage = undefined;
        console['_stdout'].write(`\tFAIL\n`);
        return reject(...params);
    }


    cli() {
        yargs
        .help('help')
        .alias('v', 'version')
        .version(function() { return require('../package').version; })
        .describe('v', 'show version information')
        .usage(banner + 'Usage: $0 <command>')
        .showHelpOnFail(false, "Specify --help for available options")
        //.help();

        let declareCommand = (managerClass, methodName, command, description, builder) => {
            yargs.command(command, description, builder, (args) => {

                let manager = this.getManagerInstance(managerClass);

                let paramtypes = Reflect.getMetadata("design:paramtypes",
                    managerClass.prototype, methodName);

//                let returnType = Reflect.getMetadata("design:returntype",
//                    managerClass.prototype, methodName);

                let params = paramtypes.map(paramType =>
                        this.getManagerInstance(paramType));

                let success = (x) => {
                    console.log(`${managerClass.name}.${methodName} success`);
                    //console.log(x);
                };

                let error = (e) => {
                    console.log(`${managerClass.name}.${methodName} failed`);
                    console.log(e, e.stack.split("\n"))
                    console.log(e);
                };


                try {
                    let result = manager[methodName](...params);
                    if( typeOf(result) === Promise ) result
                        .then(success)
                        .catch(error);
                    else
                        success(result);
                } catch(e) {
                    error(e);
                }
            });
        };



        for(let managerName in allManagers) {
            let managerEntry = allManagers[managerName];

            for(let methodName in managerEntry.commands) {
                let commandEntry = managerEntry.commands[methodName];

                declareCommand(
                    managerEntry.managerClass,
                    methodName,
                    commandEntry.command,
                    commandEntry.description,
                    commandEntry.builder
                );
            }
        }

        yargs.argv;
        //yargs.showHelp();
    }

    startRepl() {
        /*
        Inicia el repl...
        
        */
    }
}
