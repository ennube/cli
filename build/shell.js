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
var common_1 = require('./common');
var yargs = require('yargs');
var banner = '                                                               \n' +
    '        ███████╗███╗   ██╗███╗   ██╗██╗   ██╗██████╗ ███████╗  \n' +
    '        ██╔════╝████╗  ██║████╗  ██║██║   ██║██╔══██╗██╔════╝  \n' +
    '        █████╗  ██╔██╗ ██║██╔██╗ ██║██║   ██║██████╔╝█████╗    \n' +
    '        ██╔══╝  ██║╚██╗██║██║╚██╗██║██║   ██║██╔══██╗██╔══╝    \n' +
    '        ███████╗██║ ╚████║██║ ╚████║╚██████╔╝██████╔╝███████╗  \n' +
    '        ╚══════╝╚═╝  ╚═══╝╚═╝  ╚═══╝ ╚═════╝ ╚═════╝ ╚══════╝  \n' +
    '                                                               \n';
;
exports.allManagers = {};
function manager() {
    var paramTypes = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        paramTypes[_i - 0] = arguments[_i];
    }
    return function (managerClass) {
        var managerEntry = exports.allManagers[managerClass.name];
        if (managerEntry === undefined)
            managerEntry = exports.allManagers[managerClass.name] = {
                commands: {},
                paramTypes: paramTypes,
                managerClass: managerClass
            };
    };
}
exports.manager = manager;
function command(command, description, builder) {
    return function (managerPrototype, methodName, descriptor) {
        if (typeof managerPrototype == 'function')
            throw new Error((managerPrototype.name + "." + methodName + "():") +
                "static commands are not permitted");
        var managerClass = managerPrototype.constructor;
        var managerEntry = exports.allManagers[managerClass.name];
        if (managerEntry === undefined)
            managerEntry = exports.allManagers[managerClass.name] = {
                commands: {},
                paramTypes: [],
                managerClass: managerClass
            };
        managerEntry.commands[methodName] = {
            command: command,
            description: description,
            builder: builder
        };
    };
}
exports.command = command;
var Shell = (function () {
    function Shell() {
        this.allManagerInstances = new Map();
        this.allManagerInstances.set(Shell, this);
    }
    Shell.prototype.getManagerInstance = function (managerClass) {
        var _this = this;
        var manager = this.allManagerInstances.get(managerClass);
        if (manager === undefined) {
            var paramTypes = exports.allManagers[managerClass.name].paramTypes;
            manager = new (managerClass.bind.apply(managerClass, [void 0].concat(paramTypes.map(function (T) { return _this.getManagerInstance(T); }))))();
            this.allManagerInstances.set(managerClass, manager);
        }
        return manager;
    };
    Object.defineProperty(Shell.prototype, "projectDir", {
        get: function () {
            return process.cwd();
        },
        enumerable: true,
        configurable: true
    });
    Shell.prototype.task = function (message) {
        this.taskMessage = message;
        console['_stdout'].write("" + message);
    };
    Shell.prototype.resolveTask = function (resolve) {
        var params = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            params[_i - 1] = arguments[_i];
        }
        this.taskMessage = undefined;
        console['_stdout'].write("\tOK\n");
        return resolve.apply(void 0, params);
    };
    Shell.prototype.rejectTask = function (reject) {
        var params = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            params[_i - 1] = arguments[_i];
        }
        this.taskMessage = undefined;
        console['_stdout'].write("\tFAIL\n");
        return reject.apply(void 0, params);
    };
    Shell.prototype.cli = function () {
        var _this = this;
        yargs
            .usage(banner + 'Usage: $0 <command>');
        var declareCommand = function (managerClass, methodName, command, description, builder) {
            yargs.command(command, description, builder, function (args) {
                var manager = _this.getManagerInstance(managerClass);
                var paramtypes = Reflect.getMetadata("design:paramtypes", managerClass.prototype, methodName);
                var params = paramtypes.map(function (paramType) {
                    return _this.getManagerInstance(paramType);
                });
                var success = function (x) {
                    console.error(managerClass.name + "." + methodName + " execution success");
                };
                var error = function (e) {
                    console.error(managerClass.name + "." + methodName + " execution failed");
                    console.error(e);
                };
                try {
                    var result = manager[methodName].apply(manager, params);
                    if (common_1.typeOf(result) === Promise)
                        result
                            .then(success)
                            .catch(error);
                    else
                        success(result);
                }
                catch (e) {
                    error(e);
                }
            });
        };
        for (var managerName in exports.allManagers) {
            var managerEntry = exports.allManagers[managerName];
            for (var methodName in managerEntry.commands) {
                var commandEntry = managerEntry.commands[methodName];
                declareCommand(managerEntry.managerClass, methodName, commandEntry.command, commandEntry.description, commandEntry.builder);
            }
        }
        yargs.argv;
        yargs.showHelp();
    };
    Shell = __decorate([
        manager(), 
        __metadata('design:paramtypes', [])
    ], Shell);
    return Shell;
}());
exports.Shell = Shell;
//# sourceMappingURL=shell.js.map