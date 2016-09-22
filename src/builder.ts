import {Shell, Manager, manager, command} from './shell';
import {Project} from './project';

import * as child_process from 'child_process';
import * as webpack from 'webpack';
import * as fsx from 'fs-extra';

const archiver = require('archiver');


@manager()
export class Builder implements Manager {

    @command('build')
    build(shell:Shell, project: Project) {

        return Promise.resolve()

        // COMPILE THE PROJECT

        .then( () => new Promise((resolve, reject) => {
            shell.task(`Running Typescript compiler`);

            child_process.exec('tsc', (err, stdout, stderr) => {
                if(err)
                    shell.rejectTask(reject, stderr);
                else
                    shell.resolveTask(resolve, stdout);
            })
        }))

        // LOAD PROJECT IN MEMORY

        .then( () => project.ensureLoaded() )

        // RUN WEBPACK

        .then( () => new Promise((resolve, reject) => {

            shell.task('Running webpack');

            let entrySet: {
                [serviceName:string]: string[]
            } = { };

            for(let serviceName in project.serviceModules) {
                let serviceFileName = project.serviceModules[serviceName];
                entrySet[serviceName] = [serviceFileName];
            }

            let compiler = webpack({
                entry: entrySet,
                target: 'node',
                devtool: 'source-map', // debug
                externals: [
                    'aws-sdk'
                ],
                plugins: [
                    new webpack.optimize.DedupePlugin(),
                    //new webpack.optimize.OccurrenceOrderPlugin(true),
    /*                new webpack.optimize.UglifyJsPlugin({
                        compress: {
                            unused: true,
                            dead_code: true,
                            warnings: false,
                            drop_debugger: true
                        }
                    })*/
                ],
                output: {
                    libraryTarget: project.tsc.compilerOptions.module, // TODO: desde project.tsc
                    path: project.packingDir,
                    filename: "[name]/[name].js",
                },
                module: {
                    loaders: [
                        //{ test: /\.css$/, loader: "style!css" }
                    ]
                }
            });

            // show stats?

            compiler.run((err, stats) => {
                if(err)
                    shell.rejectTask(reject, err);
                else
                    shell.resolveTask(resolve, stats);
            });
        }))

        // Archve all services

        .then( () => {
            console.log('Packing services...');

            fsx.ensureDirSync(project.deploymentDir);

            let promises = [];
            for(let serviceName in project.serviceModules) {
                promises.push(new Promise((resolve, reject) => {

                    let archive = <any>archiver.create('zip', {});
                    let output = `${project.deploymentDir}/${serviceName}.zip`
                    let stream = fsx.createWriteStream(output);

                    stream.on('close', () => resolve(output))
                    archive.on('error', (error) => reject(error));
                    archive.pipe(stream);
                    archive.directory(`${project.packingDir}/${serviceName}`, '/', {});
                    archive.finalize();
                }));
            }

            return Promise.all(promises);

        });

    }


/*
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
*/

}
