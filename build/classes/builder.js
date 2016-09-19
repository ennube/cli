"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var shell_1 = require('./shell');
var child_process = require('child_process');
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
    __decorate([
        shell_1.command()
    ], Builder.prototype, "build", null);
    return Builder;
}());
exports.Builder = Builder;
//# sourceMappingURL=builder.js.map