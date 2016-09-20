"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var shell_1 = require('./shell');
var child_process = require('child_process');
var fsx = require('fs-extra');
var Builder = (function () {
    function Builder(project) {
        this.project = project;
    }
    Builder.prototype.build = function () {
        console.log("Running Typescript compiler...");
        return new Promise(function (resolve, reject) {
            child_process.exec('tsc', function (err, stdout, stderr) {
                if (err)
                    reject(stderr);
                else
                    resolve(stdout);
            });
        });
    };
    Builder.prototype.buildTemplates = function () {
        console.log('Collecting templates...');
        return this.collectTemplates(__dirname + "/../../request-templates", this.project.templates.request);
    };
    Builder.prototype.collectTemplates = function (directory, collection) {
        directory = fsx.realpathSync(directory);
        return new Promise(function (resolve, reject) {
            fsx['walk'](directory)
                .on('data', function (file) {
                var match = /\/(\w+\/\w+)\/(.*)\.vtl/.exec(file.path.substr(directory.length));
                if (match) {
                    console.log("Template found " + match[0]);
                    if (collection[match[1]] === undefined)
                        collection[match[1]] = {};
                    collection[match[1]][match[2]] = fsx.readFileSync(file.path, { encoding: 'utf8' });
                }
            })
                .on('end', function () {
                resolve();
            });
        });
    };
    __decorate([
        shell_1.command()
    ], Builder.prototype, "build", null);
    __decorate([
        shell_1.command()
    ], Builder.prototype, "buildTemplates", null);
    return Builder;
}());
exports.Builder = Builder;
//# sourceMappingURL=builder.js.map