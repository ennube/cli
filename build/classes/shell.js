"use strict";
var yargs = require('yargs');
var _ = require('lodash');
var CommandService = (function () {
    function CommandService(project) {
        this.project = project;
    }
    return CommandService;
}());
exports.CommandService = CommandService;
exports.allCommands = {};
function command(description, builder) {
    return function (servicePrototype, commandName, descriptor) {
        if (typeof servicePrototype == 'function')
            throw new Error((servicePrototype.name + "." + commandName + "():") +
                "static commands are not permitted");
        exports.allCommands[commandName] = {
            serviceClass: servicePrototype.constructor,
            description: description,
            builder: builder
        };
    };
}
exports.command = command;
var Shell = (function () {
    function Shell(project) {
        this.project = project;
        this.commandServices = new Map();
        this.commandServices.set(Shell, this);
    }
    Shell.prototype.getCommandService = function (serviceClass) {
        var commandService = this.commandServices.get(serviceClass);
        if (commandService === undefined)
            this.commandServices.set(serviceClass, commandService = new serviceClass(this.project));
        return commandService;
    };
    Shell.prototype.run = function () {
        var _this = this;
        var shell = this;
        yargs.usage('$0 <command>');
        _.forOwn(exports.allCommands, function (command, commandName) {
            yargs.command(commandName, command.description, command.builder, function (args) {
                var commandService = _this.getCommandService(command.serviceClass);
                Promise.resolve()
                    .then(function () { return commandService[commandName](args); })
                    .catch(function (x) { return console.error('ER', x); });
            });
        });
        return yargs.help().argv;
    };
    return Shell;
}());
exports.Shell = Shell;
;
//# sourceMappingURL=shell.js.map