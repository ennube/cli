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
var Packager = (function () {
    function Packager(project) {
        this.project = project;
    }
    Packager.prototype.modularStructureReplication = function () {
        this.project.ensureLoaded();
        var _loop_1 = function(serviceName) {
            console.log("replicates the modular structure of " + serviceName);
            var packingDir = this_1.project.directory + "/build/" + serviceName;
            var pendingList = [
                require.cache[this_1.project.serviceModules[serviceName]]
            ];
            var checkMap = {};
            var _loop_2 = function(dep) {
                if (dep.filename in checkMap)
                    return "continue";
                checkMap[dep.filename] = true;
                if (dep.filename.startsWith(this_1.project.buildDir))
                    location = dep.filename.substr(this_1.project.buildDir.length);
                else if (dep.filename.startsWith(this_1.project.directory))
                    location = dep.filename.substr(this_1.project.directory.length);
                else
                    return "continue";
                fs.ensureSymlinkSync(dep.filename, "" + packingDir + location, function (err) {
                    if (err)
                        console.log(err);
                    else
                        console.log(dep.filename + " \u2192 " + packingDir + location);
                });
                console.log(Object.keys(dep.children));
                pendingList.push.apply(pendingList, dep.children);
            };
            for (var _i = 0, pendingList_1 = pendingList; _i < pendingList_1.length; _i++) {
                var dep = pendingList_1[_i];
                _loop_2(dep);
            }
        };
        var this_1 = this;
        var location;
        for (var serviceName in this.project.serviceModules) {
            _loop_1(serviceName);
        }
    };
    Packager.prototype.packup = function (args) {
        this.modularStructureReplication();
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