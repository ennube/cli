import {Shell} from './shell';
import {Project} from './project';

import * as webpack from 'webpack';

export class Builder {

    constructor(public project: Project) {

    }

    @Shell.command('build')
    build(args) {
        let compiler = webpack({
            entry: {
                'index': this.project.mainModuleFileName,
            },
            output: {
                path: `${this.project.directory}/.packing`,
                filename: "[name].js",
                libraryTarget: "commonjs", // TODO: desde project.tsc
            },
            module: {
                loaders: [
                    //{ test: /\.css$/, loader: "style!css" }
                ]
            }
        });

        compiler.run((err, stats) => {
            console.log(err, stats);
        });
    }


}
