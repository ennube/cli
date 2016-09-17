import {Shell} from './shell';
import {Project} from './project';

import {allServiceRecords, handler} from '@ennube/runtime';

import * as webpack from 'webpack';
import * as child_process from 'child_process';
import * as fs from 'fs-extra';


export class Builder {

    constructor(public project: Project) {
    }

    build() {
        return new Promise((resolve, reject) => {
            child_process.exec('tsc', (err, stdout, stderr) => {
                if(err)
                    reject(stderr);
                else
                    resolve(stdout);
            })
        });
    }


    packing() {
        this.project.ensureLoaded();

        // SERVICE DISCOVER (esto puede/debe estar en project)
        let entrySet: {
            [serviceName:string]: string[]
        } = { };

        for(let moduleId in require.cache ) {
            let module = require.cache[moduleId];

            if(!module.filename.startsWith(this.project.buildDir))
                continue;

            for(let serviceRecordKey in allServiceRecords ) {
                let serviceRecord = allServiceRecords[serviceRecordKey];
                let serviceClass = serviceRecord.serviceClass;

                if( serviceClass.name in module.exports &&
                    serviceClass === module.exports[serviceClass.name]) {
                    console.log(`service class: ${serviceClass.name} FOUND` +
                                ` in ${module.filename}`);

                    entrySet[serviceClass.name] = [
                        module.filename,
                        handler.fileName
                    ];
                }
            }
        }

        // VIA MODULAR STRUCTURE REPLICATION
        for(let serviceClassName in entrySet ) {
            let entry = entrySet[serviceClassName];

            this.replicatesModularStructure(require.cache[entry[0]],
                `${this.project.directory}/build/${serviceClassName}`);
        }

        // VIA WEBPACK
        let compiler = webpack({
            entry: entrySet,
            output: {
                libraryTarget: "commonjs", // TODO: desde project.tsc
                path: `${this.project.directory}/build`,
                filename: "[name].js",
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

    replicatesModularStructure(module: NodeModule, packingDir: string) {
        let pendingList = [module];
        let checkMap = {};

        for(module of pendingList) {
            if(module.filename in checkMap)
                continue;
            checkMap[module.filename] = true;

            var location;
            if( module.filename.startsWith(this.project.buildDir) )
                location = module.filename.substr(this.project.buildDir.length);
            else if( module.filename.startsWith(this.project.directory) )
                location = module.filename.substr(this.project.directory.length);
            else
                continue;

            (fs.ensureSymlinkSync as any)(module.filename,
                `${packingDir}${location}`, (err) => {
                if(err)
                    console.log(err) // => null
//                else
//                    console.log(`${module.filename} → ${packingDir}${location}`);
            });

            pendingList.push(...module.children);
        }
    }


    @Shell.command('build')
    runBuild(args) {
        this.build()
        .then((stdout) => {
            console.log(stdout);
            this.packing()
            .then(() => {

            })
            .catch((e) => console.log(e));

        })
        .catch((e) => console.log(e));
    }
}
