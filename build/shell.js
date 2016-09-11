"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var repl_1 = require('repl');
var chalk_1 = require('chalk');
var yargs = require('yargs');
var core_1 = require('./core');
var HelpCommand = (function (_super) {
    __extends(HelpCommand, _super);
    function HelpCommand() {
        _super.apply(this, arguments);
    }
    HelpCommand.prototype.perform = function () {
        yargs.reset();
        for (var name_1 in core_1.Command.all) {
            var help = core_1.Command.all[name_1].help;
            var command = new (core_1.Command.all[name_1].command)(this.shell, this.project);
            yargs.command(name_1, help, command.describe(yargs));
        }
        yargs.showHelp();
        return core_1.resolutePromise;
    };
    return HelpCommand;
}(core_1.Command));
exports.HelpCommand = HelpCommand;
var REPL = (function (_super) {
    __extends(REPL, _super);
    function REPL(project) {
        _super.call(this);
        this.project = project;
        this.server = repl_1.start({
            prompt: chalk_1.grey.inverse(' >') + '  ',
        });
        this.inmmutable('repl', this);
        this.inmmutable('project', project);
        this.set('Command', core_1.Command);
        this.command('help', new HelpCommand(this, project));
        for (var name_2 in core_1.Command.all) {
            var command = new core_1.Command.all[name_2].command(this, project);
            var help = core_1.Command.all[name_2].help;
            this.command(name_2, command, help);
        }
    }
    REPL.prototype.command = function (name, command, help) {
        var _this = this;
        this.server.defineCommand(name, { help: help,
            action: function (options) {
                _this.server.displayPrompt(1);
                command.perform(command.describe(yargs.reset())
                    .parse(options.split(/\s/))
                    .argv)
                    .then();
                _this.server.displayPrompt();
            }
        });
    };
    REPL.prototype.set = function (variable, value) {
        this.server.context[variable] = value;
    };
    REPL.prototype.inmmutable = function (variable, value) {
        Object.defineProperty(this.server.context, variable, {
            configurable: false,
            enumerable: true,
            value: value
        });
    };
    return REPL;
}(core_1.Shell));
function repl() {
    var project = new core_1.Project(process.cwd());
    console.info('');
    console.info(chalk_1.bold.grey("\t\t _ __ __    |_  _ "));
    console.info(chalk_1.bold.grey("\t\t(/_| || ||_||_)(/_\t") + chalk_1.red("v0.1 beta"));
    console.info('');
    console.info(project.name);
    var repl = new REPL(project);
}
exports.repl = repl;
function cli() {
}
exports.cli = cli;
//# sourceMappingURL=shell.js.map