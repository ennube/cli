import {command} from './shell';
import {Project} from './project';
import * as webpack from 'webpack';
import * as child_process from 'child_process';
import * as fs from 'fs-extra';

export class Builder {

    constructor(public project: Project) {
    }

    @command()
    build() {
        console.log(`Running Typescript compiler...`);

        return new Promise((resolve, reject) => {
            child_process.exec('tsc', (err, stdout, stderr) => {
                if(err)
                    reject(stderr);
                else
                    resolve(stdout);
            })
        });
    }


}
