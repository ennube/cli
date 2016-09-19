import * as fs from 'fs-extra';
//require('source-map-support').install();
import {allServices} from '@ennube/runtime';

import * as classes from '../classes';



export class Project {
    npmFileName: string;
    tscFileName: string;

    mainModule: Object;

    npm: {
        name: string,
        version: string,
        main: string
    };

    tsc: {
        compilerOptions: {
            outDir: string;
            module: string; // for webpack target
        };
    };

    serviceModules: {
        [name:string]: string
    } = {}



    constructor(public directory:string) {
        this.npmFileName = `${directory}/package.json`;
        this.tscFileName = `${directory}/tsconfig.json`;

        if( fs.existsSync(this.npmFileName) )
            this.npm = fs.readJSONSync(this.npmFileName);
        else
            throw new Error(`You must run ennube into a npm inited directory`)

        if( fs.existsSync(this.tscFileName) )
            this.tsc = fs.readJSONSync(this.tscFileName);
        else
            throw new Error(`You must run ennube into a tsc inited directory`)

        // TODO: ensure tsc compilerOptions...

    }

    get name() {
        // ensure npm inited
        return this.npm.name;
    }
    get mainModuleFileName() {
        // ensure npm inited
        return `${this.directory}/${this.npm.main}`;
    }
    get outDir() {
        return `${this.directory}/${this.tsc.compilerOptions.outDir}`;
    }
    get buildDir() {
        return `${this.directory}/build`;
    }
    get packingDir() {
        return `${this.buildDir}/packing`;
    }
    get deploymentDir() {
        return `${this.buildDir}/deployment`;
    }

/*
    private _provider: classes.Provider;
    get provider(): classes.Provider {
        let provider = this._provider;
        if( provider === undefined )
            provider = this._provider = new classes.Provider(this);
        return provider;
    }
*/
    ensureLoaded() {
        // ensure builded, require Builder here..
        if(!this.mainModule) {
            console.log('Loading project...');
            // ... config process.env variables...
            this.mainModule = require(this.mainModuleFileName);
            // another checks here...
            this.discoverServices();
        }
    }

    discoverServices() {
        this.ensureLoaded();

        for(let moduleId in require.cache ) {
            let module = require.cache[moduleId];

            if(!module.filename.startsWith(this.directory))
                continue;

            for(let serviceName in allServices ) {
                let serviceClass = allServices[serviceName].serviceClass;

                if( serviceName in module.exports &&
                    serviceClass === module.exports[serviceClass.name]) {
                    console.log(`service ${serviceClass.name} found in ` +
                                module.filename.substr(this.outDir.length));

                    this.serviceModules[serviceName] = module.filename;

                    // ensure that the correct handler is always exported also
                }
            }
        }
    }

}
