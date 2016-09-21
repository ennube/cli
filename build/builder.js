"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var shell_1 = require('./shell');
var project_1 = require('./project');
var runtime_1 = require('@ennube/runtime');
var child_process = require('child_process');
var webpack = require('webpack');
var fsx = require('fs-extra');
var archiver = require('archiver');
var Builder = (function () {
    function Builder(shell) {
        this.shell = shell;
    }
    Builder.prototype.build = function (shell, project) {
        return Promise.resolve()
            .then(function () { return new Promise(function (resolve, reject) {
            shell.task("Running Typescript compiler");
            child_process.exec('tsc', function (err, stdout, stderr) {
                if (err)
                    shell.rejectTask(reject, stderr);
                else
                    shell.resolveTask(resolve, stdout);
            });
        }); })
            .then(function () { return project.ensureLoaded(); })
            .then(function () { return new Promise(function (resolve, reject) {
            shell.task('Running webpack');
            var entrySet = {};
            for (var serviceName in project.serviceModules) {
                var serviceFileName = project.serviceModules[serviceName];
                entrySet[serviceName] = [serviceFileName, runtime_1.handler.fileName];
            }
            var compiler = webpack({
                entry: entrySet,
                target: 'node',
                devtool: 'source-map',
                externals: [
                    'aws-sdk'
                ],
                plugins: [
                    new webpack.optimize.DedupePlugin(),
                ],
                output: {
                    libraryTarget: project.tsc.compilerOptions.module,
                    path: project.packingDir,
                    filename: "[name]/[name].js",
                },
                module: {
                    loaders: []
                }
            });
            compiler.run(function (err, stats) {
                if (err)
                    shell.rejectTask(reject, err);
                else
                    shell.resolveTask(resolve, stats);
            });
        }); })
            .then(function () {
            console.log('Packing services...');
            fsx.ensureDirSync(project.deploymentDir);
            var promises = [];
            var _loop_1 = function(serviceName) {
                promises.push(new Promise(function (resolve, reject) {
                    var archive = archiver.create('zip', {});
                    var output = project.deploymentDir + "/" + serviceName + ".zip";
                    var stream = fsx.createWriteStream(output);
                    stream.on('close', function () { return resolve(output); });
                    archive.on('error', function (error) { return reject(error); });
                    archive.pipe(stream);
                    archive.directory(project.packingDir + "/" + serviceName, '/', {});
                    archive.finalize();
                }));
            };
            for (var serviceName in project.serviceModules) {
                _loop_1(serviceName);
            }
            return Promise.all(promises);
        });
    };
    __decorate([
        shell_1.command('build'), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [shell_1.Shell, project_1.Project]), 
        __metadata('design:returntype', void 0)
    ], Builder.prototype, "build", null);
    Builder = __decorate([
        shell_1.manager(), 
        __metadata('design:paramtypes', [shell_1.Shell])
    ], Builder);
    return Builder;
}());
exports.Builder = Builder;
//# sourceMappingURL=builder.js.map