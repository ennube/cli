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
var child_process = require('child_process');
var webpack = require('webpack');
var fsx = require('fs-extra');
var pug = require('pug');
var archiver = require('archiver');
var Builder = (function () {
    function Builder(shell, project) {
        this.shell = shell;
        this.project = project;
    }
    Builder.prototype.build = function () {
        var _this = this;
        return this.runTsc()
            .then(function () { return _this.compileTemplates(); })
            .then(function () { return _this.executeWebpack(); })
            .then(function () { return _this.archiveServices(); });
    };
    Builder.prototype.runTsc = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.shell.task("Running Typescript compiler");
            //  tsc checks
            child_process.exec('tsc', function (err, stdout, stderr) {
                if (err)
                    _this.shell.rejectTask(reject, stderr);
                else
                    _this.shell.resolveTask(resolve, stdout);
            });
        });
    };
    Builder.prototype.compileTemplates = function () {
        var _this = this;
        var templateDir = this.project.sourceDir;
        var outDir = this.project.outDir;
        return new Promise(function (resolve, reject) {
            console.log('Compiling pugs templates...');
            var pugOptions = {
                basedir: templateDir,
                inlineRuntimeFunctions: true,
            };
            fsx['walk'](_this.project.sourceDir)
                .on('data', function (file) {
                var match = /(.*)?\/([\w]+)\.([\w]+)\.pug/.exec(file.path.substr(templateDir.length));
                console.log(file.path.substr(templateDir.length));
                if (match) {
                    var fileName = match[0];
                    var jsModule = (match[1] || '') + "/" + match[2];
                    var functionName = match[3];
                    console.log(("Attaching '" + functionName + "' template ") +
                        ("from " + fileName + " to " + jsModule));
                    var compiled = pug.compileFileClient(file.path, Object.assign({
                        //let compiled = pug.compileFile(file.path, Object.assign({
                        filename: fileName,
                    }, pugOptions));
                    fsx.appendFileSync(outDir + "/" + jsModule + ".js", ("\n/* pug template " + fileName + "*/\n") +
                        ("function " + functionName + "(locals) {\n") +
                        ("   " + compiled + "\n") +
                        "   return template(locals);\n" +
                        "}\n");
                }
            })
                .on('end', function () {
                resolve();
            });
        });
    };
    Builder.prototype.executeWebpack = function () {
        var _this = this;
        this.project.ensureLoaded();
        return new Promise(function (resolve, reject) {
            _this.shell.task('Executing webpack');
            var entrySet = {};
            for (var serviceName in _this.project.serviceModules) {
                var serviceFileName = _this.project.serviceModules[serviceName];
                entrySet[serviceName] = [serviceFileName];
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
                    libraryTarget: _this.project.tsc.compilerOptions.module,
                    path: _this.project.packingDir,
                    filename: "[name]/[name].js",
                },
                module: {
                    loaders: []
                }
            });
            // show stats?
            compiler.run(function (err, stats) {
                if (err)
                    _this.shell.rejectTask(reject, err);
                else
                    _this.shell.resolveTask(resolve, stats);
            });
        });
    };
    Builder.prototype.archiveServices = function () {
        var _this = this;
        console.log('Packing services...');
        fsx.ensureDirSync(this.project.deploymentDir);
        var promises = [];
        var _loop_1 = function(serviceName) {
            promises.push(new Promise(function (resolve, reject) {
                var archive = archiver.create('zip', {});
                var output = _this.project.deploymentDir + "/" + serviceName + ".zip";
                var stream = fsx.createWriteStream(output);
                stream.on('close', function () { return resolve(output); });
                archive.on('error', function (error) { return reject(error); });
                archive.pipe(stream);
                archive.directory(_this.project.packingDir + "/" + serviceName, '/', {});
                archive.finalize();
            }));
        };
        for (var serviceName in this.project.serviceModules) {
            _loop_1(serviceName);
        }
        return Promise.all(promises);
    };
    __decorate([
        shell_1.command('build'), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], Builder.prototype, "build", null);
    Builder = __decorate([
        shell_1.manager(shell_1.Shell, project_1.Project), 
        __metadata('design:paramtypes', [shell_1.Shell, project_1.Project])
    ], Builder);
    return Builder;
}());
exports.Builder = Builder;
//# sourceMappingURL=builder.js.map