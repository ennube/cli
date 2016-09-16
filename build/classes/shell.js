"use strict";
var yargs = require('yargs');
var _ = require('lodash');
var Shell = (function () {
    function Shell(project) {
        this.project = project;
        this.commandServices = new Map;
        this.commandServices.set(Shell, this);
    }
    Shell.command = function (command, description, builder) {
        return function (prototype, methodName, descriptor) {
            Shell.commands[command] = {
                constructor: prototype.constructor,
                methodName: methodName, descriptor: descriptor, description: description, builder: builder
            };
        };
    };
    Shell.prototype.run = function () {
        var _this = this;
        var shell = this;
        yargs.usage('$0 <command>');
        var mainModule = require(this.project.mainModuleFileName);
        _.forOwn(Shell.commands, function (info, command) {
            yargs.command(command, info.description, info.builder, function (args) {
                var commandService;
                if (_this.commandServices.has(info.constructor))
                    commandService = _this.commandServices.get(info.constructor);
                else {
                    commandService = new info.constructor(_this.project);
                }
                try {
                    var result = commandService[info.methodName](args);
                }
                catch (e) {
                    console.log(e);
                }
            });
        });
        return yargs.help().argv;
    };
    Shell.commands = {};
    return Shell;
}());
exports.Shell = Shell;
;
//# sourceMappingURL=shell.js.map