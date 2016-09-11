import {Promise} from 'es6-promise';
import {Project, Shell, Command, Step, ParallelTask, SerialTask} from '../core';
import * as utils from '../utils';
import {exec} from 'child_process';

@Command.register('build', 'Builds project')
export abstract class BuildCommand extends Command {
    perform(options: Object) {
        return new BuildProject(this.project).perform();
    }
}


class BuildProject extends SerialTask {
    constructor(project: Project) {
        super(`Building ${project.name}`);
        this.appendStep( new Transpile(project.tsconfig) );
        this.appendStep( new ZipDirectory(project.buildDir) );
    }
}

class Transpile extends Step {
    constructor(public transpilerOptions:any) {
        super(`Transpiling...`);
    }

    perform() {
        return new Promise((resolve, reject) => {
            exec('tsc', (err, stdout, stderr) => {
                if(err)
                    reject(stderr);
                else
                    resolve();
            })
        });
    }
};


class ZipDirectory extends Step {
    constructor(public directory:string) {
        super(`Zipping ${directory}`);
    }

    perform() {
        return utils.zipDirectory(this.directory);
    }
};
