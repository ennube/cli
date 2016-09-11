"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var es6_promise_1 = require('es6-promise');
var core_1 = require('../core');
var utils = require('../utils');
var child_process_1 = require('child_process');
var BuildCommand = (function (_super) {
    __extends(BuildCommand, _super);
    function BuildCommand() {
        _super.apply(this, arguments);
    }
    BuildCommand.prototype.perform = function (options) {
        return new BuildProject(this.project).perform();
    };
    BuildCommand = __decorate([
        core_1.Command.register('build', 'Builds project'), 
        __metadata('design:paramtypes', [])
    ], BuildCommand);
    return BuildCommand;
}(core_1.Command));
exports.BuildCommand = BuildCommand;
var BuildProject = (function (_super) {
    __extends(BuildProject, _super);
    function BuildProject(project) {
        _super.call(this, "Building " + project.name);
        this.appendStep(new Transpile(project.tsconfig));
        this.appendStep(new ZipDirectory(project.buildDir));
    }
    return BuildProject;
}(core_1.SerialTask));
var Transpile = (function (_super) {
    __extends(Transpile, _super);
    function Transpile(transpilerOptions) {
        _super.call(this, "Transpiling...");
        this.transpilerOptions = transpilerOptions;
    }
    Transpile.prototype.perform = function () {
        return new es6_promise_1.Promise(function (resolve, reject) {
            child_process_1.exec('tsc', function (err, stdout, stderr) {
                if (err)
                    reject(stderr);
                else
                    resolve();
            });
        });
    };
    return Transpile;
}(core_1.Step));
;
var ZipDirectory = (function (_super) {
    __extends(ZipDirectory, _super);
    function ZipDirectory(directory) {
        _super.call(this, "Zipping " + directory);
        this.directory = directory;
    }
    ZipDirectory.prototype.perform = function () {
        return utils.zipDirectory(this.directory);
    };
    return ZipDirectory;
}(core_1.Step));
;
//# sourceMappingURL=index.js.map