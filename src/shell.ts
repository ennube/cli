import {start/*, REPLServer*/} from 'repl';
import {italic, bold, inverse, red, yellow, grey} from 'chalk';
import * as yargs from 'yargs';

import {Project, Shell, Command, resolutePromise} from './core';
import * as aws from './provider/aws';


export class HelpCommand extends Command {
    perform() {
        yargs.reset();

        for(let name in Command.all) {
            let help = Command.all[name].help;
            let command = new (Command.all[name].command)(this.shell, this.project);

            yargs.command(name, help, command.describe(yargs));
        }
        yargs.showHelp();

        return resolutePromise;
    }
}


class REPL extends Shell {
    server: any;
    //commands: { [key:string]: {Command} };

    constructor(public project: Project) {
        super();

        this.server = start({
            prompt: grey.inverse(' >') + '  ',
        })
        //.on('exit')
        ;

        this.inmmutable('repl', this);
        this.inmmutable('project', project);
        this.set('Command', Command);

        this.command('help', new HelpCommand(this, project) );
        for(let name in Command.all) {
            let command = new Command.all[name].command(this, project);
            let help = Command.all[name].help;
            this.command(name, command, help);
        }
    }

    command(name:string, command: Command, help?:string) {
        //name = name || command.constructor['commandName'];
        //help = help || command.constructor['commandHelp'];

        this.server.defineCommand(name, { help,
            action: (options) => {
                this.server.displayPrompt(1);

                command.perform(
                    command.describe(yargs.reset())
                    .parse(options.split(/\s/))
                    .argv
                )
                .then()

                this.server.displayPrompt();
            }
        });
        //this.commands[name] = command;
    }



    set(variable:string, value:any) {
        this.server.context[variable] = value;
    }

    inmmutable(variable:string, value:any) {
        Object.defineProperty(this.server.context, variable, {
          configurable: false,
          enumerable: true,
          value
        });
    }
}
/*
class CLI implements Shell {

}
*/

export function repl() {
    let project = new Project( process.cwd() );

    console.info('');
    console.info(bold.grey(`\t\t _ __ __    |_  _ `));
    console.info(bold.grey(`\t\t(/_| || ||_||_)(/_\t`) +   red(`v0.1 beta`));
    console.info('');
    console.info(project.name);

    let repl =  new REPL(project);

}

export function cli() {

}
