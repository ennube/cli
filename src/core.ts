import {Promise} from 'es6-promise';
import * as utils from './utils';

export const resolutePromise = new Promise( (ok) => ok() );

export class Project {
    rootDir: string;

    packageHasChanged: Boolean = false;
    package: {
        name: string;
        version: string;
    };

    tsconfigHasChanged: Boolean = false;
    tsconfig: {
        compilerOptions: {
            outDir: string;
        };
    };


    configHasChanged: Boolean = false;
    config: {
        stackName: string;
    };

    constructor(rootDir:string) {
        this.rootDir = rootDir;
        // si no existen, genera estos archivos
        this.package = utils.readJsonSync(rootDir + '/package.json');
        this.tsconfig = utils.readJsonSync(rootDir + '/tsconfig.json');
        this.config = utils.readYamlSync(rootDir + '/ennube.yml');
    }

    updateChanges() {
        if(this.packageHasChanged)
            utils.writeJsonSync(this.rootDir + '/package.json', this.package);

        if(this.configHasChanged)
            utils.writeYamlSync(this.rootDir + '/ennube.yaml', this.config);
    }
/*
    deployer(stage:string='dev', region:string='us-east-1') {
        return new Deployer(this, stage, region);
    }
*/
    get name(): string {
        return this.package.name;
    }

    get buildDir(): string {
        return this.tsconfig.compilerOptions.outDir;
    }

}


export abstract class Shell {
};


export abstract class Command {
    static all: { [key:string]: {
        help: string,
        command: any
    }} = {};

    static register(name: string, help?:string) {
        return (command: any) => {
            Command.all[name] = {
                help: help,
                command
            };
            return command;
        };
    }

    constructor(public shell: Shell, public project: Project) {
    }

    describe(yargs) {
        return yargs;
    }

    abstract perform(options: any);


}



export abstract class Step {
    previusStep: Step;
    nextStep: Step;
    task: Task;

    constructor(public name:string) {
    }

    toString() {
        return this.name;
    }


    insertBefore(step: Step) {
        step.previusStep = this.previusStep;
        step.task = this.task;

        if(this.previusStep === undefined)
            this.task.firstStep = step;
        this.previusStep = step;
    }

    insertAfter(step: Step) {
        step.nextStep = this.nextStep;
        step.task = this.task;

        if(this.nextStep === undefined)
            this.task.lastStep = step;
        this.nextStep = step;
    }

    abstract perform(): Promise<any>;

}


export abstract class Task extends Step {
    firstStep: Step;
    lastStep: Step;
    //allSteps: { [key:string]: Step };

    appendStep(childStep: Step) {
        childStep.task = this;
        childStep.previusStep = this.lastStep;

        if(this.lastStep === undefined)
            this.firstStep = childStep;
        else
            this.lastStep.nextStep = childStep;
        this.lastStep = childStep;
    }

    prependStep(childStep: Step) {
        childStep.task = this;
        childStep.nextStep = this.firstStep;

        if(this.firstStep === undefined)
            this.lastStep = childStep;
        else
            this.firstStep.previusStep = childStep;
        this.firstStep = childStep;
    }

    stepCount(){
        let stepCount = 0;
        let step = this.firstStep;
        while(step !== undefined) {
            stepCount += 1;
            step = step.nextStep;
        }
        return stepCount;
    }
}


export abstract class SerialTask extends Task {
    perform() {
        if(!this.task)
            console.log(this.toString());
        return new Promise((resolve, reject) => {
            let step = this.firstStep;
            let run = () => {
                if(step === undefined)
                    return resolve();

                console.log(step.toString());

                step
                .perform()
                .catch(e => reject(e))
                .then(() => {
                    step = step.nextStep;
                    console.log('OK');
                    run();
                })

            };
            run();
        });
    }
}

export abstract class ParallelTask extends Task {
    perform() {
        if(!this.task)
            console.log(`${this.toString()} parallel`);

        return new Promise((resolve, reject) => {
            let stepCount = this.stepCount();
            let completedSteps = 0;

            let step = this.firstStep;
            while(step !== undefined){
                step.perform()
                .catch(e => reject(e))
                .then(() => {
                    completedSteps += 1;
                    if(completedSteps >= stepCount)
                        resolve();
                })
                step = step.nextStep;
            }
        });
    }
}
