"use strict";
var fs = require('fs-extra');
var runtime_1 = require('@ennube/runtime');
var classes = require('../classes');
var Project = (function () {
    function Project(directory) {
        this.directory = directory;
        this.serviceModules = {};
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
    Object.defineProperty(Project.prototype, "buildDir", {
        get: function () {
            return this.directory + "/" + this.tsc.compilerOptions.outDir;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Project.prototype, "mainModuleFileName", {
        get: function () {
            return this.directory + "/" + this.npm.main;
        },
        enumerable: true,
        configurable: true
    });
    Project.prototype.ensureLoaded = function () {
        if (!this.mainModule) {
            this.mainModule = require(this.mainModuleFileName);
            this.discoverServices();
        }
    };
    Object.defineProperty(Project.prototype, "builder", {
        get: function () {
            var builder = this._builder;
            if (!builder)
                builder = this._builder = new classes.Builder(this);
            return builder;
        },
        enumerable: true,
        configurable: true
    });
    Project.prototype.discoverServices = function () {
        this.ensureLoaded();
        for (var moduleId in require.cache) {
            var module_1 = require.cache[moduleId];
            if (!module_1.filename.startsWith(this.buildDir))
                continue;
            for (var serviceName in runtime_1.serviceClasses) {
                var serviceClass = runtime_1.serviceClasses[serviceName];
                if (serviceName in module_1.exports &&
                    serviceClass === module_1.exports[serviceClass.name]) {
                    console.log(("service " + serviceClass.name + " found in ") +
                        module_1.filename.substr(this.buildDir.length));
                    this.serviceModules[serviceName] = module_1.filename;
                }
            }
        }
    };
    return Project;
}());
exports.Project = Project;
//# sourceMappingURL=project.js.map