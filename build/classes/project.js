"use strict";
var fs = require('fs-extra');
var Project = (function () {
    function Project(directory) {
        this.directory = directory;
        this.npmFileName = directory + "/package.json";
        this.tscFileName = directory + "/tsconfig.json";
        if (fs.existsSync(this.npmFileName))
            this.npm = fs.readJSONSync(this.npmFileName);
        else
            throw new Error("You must run ennube into a npm inited directory");
        if (fs.existsSync(this.tscFileName))
            this.tsc = fs.readJSONSync(this.tscFileName);
        else
            throw new Error("You must run ennube into a tsc inited directory");
    }
    Object.defineProperty(Project.prototype, "mainModuleFileName", {
        get: function () {
            return this.directory + "/" + this.npm.main;
        },
        enumerable: true,
        configurable: true
    });
    Project.prototype.loadMainModule = function () {
        return this.mainModule = require(this.mainModuleFileName);
    };
    Object.defineProperty(Project.prototype, "isLoaded", {
        get: function () {
            return !!this.mainModule;
        },
        enumerable: true,
        configurable: true
    });
    return Project;
}());
exports.Project = Project;
//# sourceMappingURL=project.js.map