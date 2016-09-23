import {Shell, Manager, manager, command} from './shell';
import {Project} from './project';

import * as child_process from 'child_process';
import * as webpack from 'webpack';
import * as fsx from 'fs-extra';
import * as pug from 'pug';

const archiver = require('archiver');


@manager(Shell, Project)
export class Builder implements Manager {
    constructor(public shell:Shell, public project:Project){
    }

    @command('build')
    build() {

        return this.runTsc()
        .then( () => this.compileTemplates() )
        .then( () => this.executeWebpack() )
        .then( () => this.archiveServices() );

    }

    runTsc() {
        return new Promise((resolve, reject) => {
            this.shell.task(`Running Typescript compiler`);

            //  tsc checks

            child_process.exec('tsc', (err, stdout, stderr) => {
                if(err)
                    this.shell.rejectTask(reject, stderr);
                else
                    this.shell.resolveTask(resolve, stdout);
            })
        })
    }

    compileTemplates() {
        let templateDir = this.project.sourceDir;
        let outDir = this.project.outDir;

        return new Promise((resolve, reject) => {
            console.log('Compiling pugs templates...');

            let pugOptions = {
                basedir: templateDir,
                inlineRuntimeFunctions: true,
            };

            fsx['walk'](this.project.sourceDir)
            .on('data', function (file) {
                let match = /(.*)?\/([\w]+)\.([\w]+)\.pug/.exec(
                    file.path.substr(templateDir.length));

                console.log(file.path.substr(templateDir.length));

                if( match ) {
                    let fileName = match[0];
                    let jsModule = `${match[1]||''}/${match[2]}`;
                    let functionName = match[3];

                    console.log(`Attaching '${functionName}' template `+
                                `from ${fileName} to ${jsModule}`);

                    let compiled = pug.compileFileClient(file.path, Object.assign({
                    //let compiled = pug.compileFile(file.path, Object.assign({
                        filename: fileName,
                        //name: functionName
                    }, pugOptions));

                    fsx.appendFileSync(`${outDir}/${jsModule}.js`,
                        `\n/* pug template ${fileName}*/\n`+
                        `function ${functionName}(locals) {\n` +
                        `   ${compiled}\n` +
                        `   return template(locals);\n` +
                        `}\n`
                    );

                }
            })
            .on('end', function () {
                resolve();
            })
        });
    }


    executeWebpack() {
        this.project.ensureLoaded();
        return new Promise((resolve, reject) => {

            this.shell.task('Executing webpack');

            let entrySet: {
                [serviceName:string]: string[]
            } = { };

            for(let serviceName in this.project.serviceModules) {
                let serviceFileName = this.project.serviceModules[serviceName];
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
                    libraryTarget: this.project.tsc.compilerOptions.module, // TODO: desde this.project.tsc
                    path: this.project.packingDir,
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
                    this.shell.rejectTask(reject, err);
                else
                    this.shell.resolveTask(resolve, stats);
            });
        });
    }

    archiveServices() {
        console.log('Packing services...');

        fsx.ensureDirSync(this.project.deploymentDir);

        let promises = [];
        for(let serviceName in this.project.serviceModules) {
            promises.push(new Promise((resolve, reject) => {

                let archive = <any>archiver.create('zip', {});
                let output = `${this.project.deploymentDir}/${serviceName}.zip`
                let stream = fsx.createWriteStream(output);

                stream.on('close', () => resolve(output))
                archive.on('error', (error) => reject(error));
                archive.pipe(stream);
                archive.directory(`${this.project.packingDir}/${serviceName}`, '/', {});
                archive.finalize();
            }));
        }

        return Promise.all(promises);
    }

}
