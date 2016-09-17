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
var runtime_1 = require('@ennube/runtime');
var webpack = require('webpack');
var child_process = require('child_process');
var fs = require('fs-extra');
var Builder = (function () {
    function Builder(project) {
        this.project = project;
    }
    Builder.prototype.build = function () {
        return new Promise(function (resolve, reject) {
            child_process.exec('tsc', function (err, stdout, stderr) {
                if (err)
                    reject(stderr);
                else
                    resolve(stdout);
            });
        });
    };
    Builder.prototype.replicatesModularStructure = function (module, packingDir) {
        var pendingList = [module];
        var checkMap = {};
        for (var _i = 0, pendingList_1 = pendingList; _i < pendingList_1.length; _i++) {
            module = pendingList_1[_i];
            if (module.filename in checkMap)
                continue;
            checkMap[module.filename] = true;
            var location;
            if (module.filename.startsWith(this.project.buildDir))
                location = module.filename.substr(this.project.buildDir.length);
            else if (module.filename.startsWith(this.project.directory))
                location = module.filename.substr(this.project.directory.length);
            else
                continue;
            console.log(module.filename + " \u2192 " + packingDir + location);
            fs.ensureSymlinkSync(module.filename, "" + packingDir + location, function (err) {
                console.log(err);
            });
            pendingList.push.apply(pendingList, module.children);
        }
    };
    Builder.prototype.packing = function () {
        this.project.ensureLoaded();
        var entrySet = {};
        for (var moduleId in require.cache) {
            var module_1 = require.cache[moduleId];
            if (!module_1.filename.startsWith(this.project.buildDir))
                continue;
            for (var serviceRecordKey in runtime_1.allServiceRecords) {
                var serviceRecord = runtime_1.allServiceRecords[serviceRecordKey];
                var serviceClass = serviceRecord.serviceClass;
                if (serviceClass.name in module_1.exports &&
                    serviceClass === module_1.exports[serviceClass.name]) {
                    console.log(("service class: " + serviceClass.name + " FOUND") +
                        (" in " + module_1.filename));
                    this.replicatesModularStructure(module_1, this.project.directory + "/build/" + serviceClass.name);
                    entrySet[serviceClass.name] = [
                        module_1.filename,
                        runtime_1.handler.fileName
                    ];
                }
            }
        }
        for (var serviceClassName in entrySet) {
        }
        var compiler = webpack({
            entry: entrySet,
            output: {
                libraryTarget: "commonjs",
                path: this.project.directory + "/build",
                filename: "[name].js",
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
    Builder.prototype.runBuild = function (args) {
        var _this = this;
        this.build()
            .then(function (stdout) {
            console.log(stdout);
            _this.packing()
                .then(function () {
            })
                .catch(function (e) { return console.log(e); });
        })
            .catch(function (e) { return console.log(e); });
    };
    __decorate([
        shell_1.Shell.command('build'), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [Object]), 
        __metadata('design:returntype', void 0)
    ], Builder.prototype, "runBuild", null);
    return Builder;
}());
exports.Builder = Builder;
function avoidCircularDependencies(key, callback) {
    var pendingList = [key];
    var checkMap = {};
    for (var _i = 0, pendingList_2 = pendingList; _i < pendingList_2.length; _i++) {
        key = pendingList_2[_i];
        if (key in checkMap)
            continue;
        checkMap[key] = true;
        pendingList.push.apply(pendingList, callback(key));
    }
}
//# sourceMappingURL=builder.js.map