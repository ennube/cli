import {command} from './shell';
import {Project, TemplateCollection} from './project';
import * as webpack from 'webpack';
import * as child_process from 'child_process';
import * as fsx from 'fs-extra';

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

    @command()
    buildTemplates() {
        console.log('Collecting templates...');
        return this.collectTemplates(
            `${__dirname}/../../request-templates`,
            this.project.templates.request);

    }

    collectTemplates(directory:string, collection: TemplateCollection){
        directory = fsx.realpathSync(directory);

        return new Promise((resolve, reject) => {
            fsx['walk'](directory)
            .on('data', function (file) {
                let match = /\/(\w+\/\w+)\/(.*)\.vtl/.exec(
                    file.path.substr(directory.length));
                if( match ) {
                    console.log(`Template found ${match[0]}`);
                    if( collection[match[1]] === undefined )
                        collection[match[1]] = {}
                    collection[match[1]][match[2]] = fsx.readFileSync(file.path, {encoding:'utf8'});
                }

            })
            .on('end', function () {
                resolve();
            })

        });
    }


}
