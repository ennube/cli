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
var webpack = require('webpack');
var Builder = (function () {
    function Builder(project) {
        this.project = project;
    }
    Builder.prototype.build = function (args) {
        var compiler = webpack({
            entry: {
                'index': this.project.mainModuleFileName,
            },
            output: {
                path: this.project.directory + "/.packing",
                filename: "[name].js",
                libraryTarget: "commonjs",
            },
            module: {
                loaders: []
            }
        });
        compiler.run(function (err, stats) {
            console.log(err, stats);
        });
    };
    __decorate([
        shell_1.Shell.command('build'), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [Object]), 
        __metadata('design:returntype', void 0)
    ], Builder.prototype, "build", null);
    return Builder;
}());
exports.Builder = Builder;
//# sourceMappingURL=builder.js.map