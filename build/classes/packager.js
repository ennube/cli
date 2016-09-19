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
var fs = require('fs-extra');
var webpack = require('webpack');
var archiver = require('archiver');
var Packager = (function () {
    function Packager(project) {
        this.project = project;
    }
    Packager.prototype.packup = function (args) {
        var _this = this;
        this.webpackServices().then(function () {
            _this.zip();
        });
    };
    Packager.prototype.webpackServices = function () {
        console.log('Packing services...');
        this.project.ensureLoaded();
        var entrySet = {};
        for (var serviceName in this.project.serviceModules) {
            var serviceFilename = this.project.serviceModules[serviceName];
            entrySet[serviceName] = [serviceFilename];
        }
        var compiler = webpack({
            entry: entrySet,
            output: {
                libraryTarget: this.project.tsc.compilerOptions.module,
                path: this.project.packingDir,
                filename: "[name]/[name].js",
            },
            module: {
                loaders: []
            }
        });
        return new Promise(function (resolve, reject) {
            compiler.run(function (err, stats) {
                if (err)
                    reject(err);
                else
                    resolve(stats);
            });
        });
    };
    Packager.prototype.zip = function () {
        var _this = this;
        console.log('Zipping services...');
        fs.ensureDirSync(this.project.deploymentDir);
        var promises = [];
        var _loop_1 = function(serviceName) {
            promises.push(new Promise(function (resolve, reject) {
                var archive = archiver.create('zip', {});
                var output = _this.project.deploymentDir + "/" + serviceName + ".zip";
                var stream = fs.createWriteStream(output);
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
        shell_1.Shell.command('packup'), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [Object]), 
        __metadata('design:returntype', void 0)
    ], Packager.prototype, "packup", null);
    return Packager;
}());
exports.Packager = Packager;
//# sourceMappingURL=packager.js.map