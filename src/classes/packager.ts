import {command} from './shell';
import {Project} from './project';

import * as fs from 'fs-extra';
import * as webpack from 'webpack';
import * as archiver from 'archiver';

export class Packager {
    constructor(public project:Project){

    }

    @command('packup')
    packup(args?) {
        return this.packupProjectSergments()
        .then(() => this.zip());
    }


    packupProjectSergments() {
        console.log('Packing services...');
        this.project.ensureLoaded();

        let entrySet: {
            [serviceName:string]: string[]
        } = { };

        for(let serviceName in this.project.serviceModules) {
            let serviceFilename = this.project.serviceModules[serviceName];
            entrySet[serviceName] = [serviceFilename];
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
                libraryTarget: this.project.tsc.compilerOptions.module, // TODO: desde project.tsc
                path: this.project.packingDir,
                filename: "[name]/[name].js",
            },
            module: {
                loaders: [
                    //{ test: /\.css$/, loader: "style!css" }
                ]
            }
        });

        return new Promise((resolve, reject) => {
            compiler.run((err, stats) => {
                if(err)
                    reject(err);
                else
                    resolve(stats);
            });
        });
    }

    zip() {
        console.log('Zipping services...');

        fs.ensureDirSync(this.project.deploymentDir);

        let promises = [];
        for(let serviceName in this.project.serviceModules) {
            promises.push(new Promise((resolve, reject) => {
                let archive = <any>archiver.create('zip', {});
                let output = `${this.project.deploymentDir}/${serviceName}.zip`
                let stream = fs.createWriteStream(output);
                stream.on('close', () => resolve(output))
                archive.on('error', (error) => reject(error));
                archive.pipe(stream);
                archive.directory(`${this.project.packingDir}/${serviceName}`, '/', {});
                archive.finalize();
            }));
        }
        return Promise.all(promises);
    }


    /*

    modularStructureReplication() {
        this.project.ensureLoaded();

        for(let serviceName in this.project.serviceModules) {
            console.log(`replicates the modular structure of ${serviceName}`);
            let packingDir = `${this.project.directory}/build/${serviceName}`;
            let pendingList = [
                require.cache[this.project.serviceModules[serviceName]]
            ];
            console.log(pendingList);
            let checkMap = {};

            for(let dep of pendingList) {
                if(dep.filename in checkMap)
                    continue;
                checkMap[dep.filename] = true;

                var location;
                if( dep.filename.startsWith(this.project.buildDir) )
                    location = dep.filename.substr(this.project.buildDir.length);
                else if( dep.filename.startsWith(this.project.directory) )
                    location = dep.filename.substr(this.project.directory.length);
                else
                    continue; // XXX: skip system global deps, sure??

                (fs.ensureSymlinkSync as any)(dep.filename,
                    `${packingDir}${location}`, (err) => {
                    if(err)
                        console.log(err) // => null
                    else
                        console.log(`${dep.filename} → ${packingDir}${location}`);
                });

                console.log(Object.keys(dep.children));
                pendingList.push(...dep.children);
            }
        }
    }
    */

}
