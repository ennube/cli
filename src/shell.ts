import {typeOf} from './common';
import * as yargs from 'yargs'

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
    new(shell: Shell): Manager;
};

export interface Manager {

}

export const allManagers: {
    [managerName:string]: {
        managerClass: ManagerClass,
        commands: {
            [methodName:string]: {
                command: string,
                description?: string,
                builder?: any,
            }
        }
    }
} = {};


export function manager() {
    return (managerClass: ManagerClass) => {
        let managerEntry = allManagers[managerClass.name];
        if( managerEntry === undefined )
            managerEntry = allManagers[managerClass.name] = {
                commands: { },
                managerClass
            };
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
        if( manager === undefined )
            this.allManagerInstances.set(managerClass,
                manager = new managerClass(this));

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
        .usage(banner + 'Usage: $0 <command>')
        //.help('help');

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
                    console.error(`${managerClass.name}.${methodName} execution success`);
                    //console.error(x);
                };

                let error = (e) => {
                    console.error(`${managerClass.name}.${methodName} execution failed`);
                    console.error(e);
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
        yargs.showHelp();
    }
}
