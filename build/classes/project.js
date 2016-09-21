"use strict";
var runtime_1 = require('@ennube/runtime');
var fs = require('fs-extra');
var Project = (function () {
    function Project(directory) {
        this.directory = directory;
        this.serviceModules = {};
        this.templates = {
            request: {},
            response: {}
        };
        this.directory = directory || process.cwd();
        this.deployHash = (new Date()).toJSON();
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
    Object.defineProperty(Project.prototype, "name", {
        get: function () {
            return this.npm.name;
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
    Object.defineProperty(Project.prototype, "outDir", {
        get: function () {
            return this.directory + "/" + this.tsc.compilerOptions.outDir;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Project.prototype, "buildDir", {
        get: function () {
            return this.directory + "/build";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Project.prototype, "packingDir", {
        get: function () {
            return this.buildDir + "/packing";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Project.prototype, "deploymentDir", {
        get: function () {
            return this.buildDir + "/deployment";
        },
        enumerable: true,
        configurable: true
    });
    Project.prototype.ensureLoaded = function () {
        if (!this.mainModule) {
            console.log('Loading project...');
            this.mainModule = require(this.mainModuleFileName);
            this.discoverServices();
        }
    };
    Project.prototype.discoverServices = function () {
        this.ensureLoaded();
        for (var moduleId in require.cache) {
            var module_1 = require.cache[moduleId];
            if (!module_1.filename.startsWith(this.directory))
                continue;
            for (var serviceName in runtime_1.allServices) {
                var serviceClass = runtime_1.allServices[serviceName].serviceClass;
                if (serviceName in module_1.exports &&
                    serviceClass === module_1.exports[serviceClass.name]) {
                    console.log(("service " + serviceClass.name + " found in ") +
                        module_1.filename.substr(this.outDir.length));
                    this.serviceModules[serviceName] = module_1.filename;
                }
            }
        }
    };
    return Project;
}());
exports.Project = Project;
//# sourceMappingURL=project.js.map