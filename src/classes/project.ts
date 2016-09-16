import * as fs from 'fs-extra';
//require('source-map-support').install();

export class Project {
    npmFileName: string;
    tscFileName: string;
//    stackFileName: string;

    npm: {
        name: string,
        version: string,
        main: string
    };

    tsc: {
        compilerOptions: {
            outDir: string;
        };
    };


    mainModule: Object;

//    index: any; // ..loaded module index..

    constructor(public directory:string) {
        this.npmFileName = `${directory}/package.json`;
        this.tscFileName = `${directory}/tsconfig.json`;
//        this.stackFileName = `${directory}/ennube.json`;

        if( fs.existsSync(this.npmFileName) )
            this.npm = fs.readJSONSync(this.npmFileName);
        else
            throw new Error(`You must run ennube into a npm inited directory`)

        if( fs.existsSync(this.tscFileName) )
            this.tsc = fs.readJSONSync(this.tscFileName);
        else
            throw new Error(`You must run ennube into a tsc inited directory`)

/*
        if( fs.existsSync(this.stackFileName) )
            this.stack = fs.readJSONSync(this.stackFileName);
        else
            this.stack = {};*/
    }

    get mainModuleFileName() {
        return `${this.directory}/${this.npm.main}`;
    }

    loadMainModule() {
        // TODO: check
        return this.mainModule = require(this.mainModuleFileName);
    }

    get isLoaded(){
        return !!this.mainModule;
    }


/*
    save() {
//        fs.writeJSONSync(this.stackFileName, this.stack);
        fs.writeJSONSync(this.npmFileName, this.npm);
    }
*/
}
