import {Shell} from './shell';
import {Project} from './project';
import * as fs from 'fs-extra';

export class Packager {
    constructor(public project:Project){

    }

    modularStructureReplication() {
        this.project.ensureLoaded();

        for(let serviceName in this.project.serviceModules) {
            console.log(`replicates the modular structure of ${serviceName}`);
            let packingDir = `${this.project.directory}/build/${serviceName}`;
            let pendingList = [
                require.cache[this.project.serviceModules[serviceName]]
            ];
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

    //@Task.step('stepname')
    @Shell.command('packup')
    packup(args) {
        this.modularStructureReplication();
    }

}
