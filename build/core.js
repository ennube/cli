"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var es6_promise_1 = require('es6-promise');
var utils = require('./utils');
exports.resolutePromise = new es6_promise_1.Promise(function (ok) { return ok(); });
var Project = (function () {
    function Project(rootDir) {
        this.packageHasChanged = false;
        this.tsconfigHasChanged = false;
        this.configHasChanged = false;
        this.rootDir = rootDir;
        this.package = utils.readJsonSync(rootDir + '/package.json');
        this.tsconfig = utils.readJsonSync(rootDir + '/tsconfig.json');
        this.config = utils.readYamlSync(rootDir + '/ennube.yml');
    }
    Project.prototype.updateChanges = function () {
        if (this.packageHasChanged)
            utils.writeJsonSync(this.rootDir + '/package.json', this.package);
        if (this.configHasChanged)
            utils.writeYamlSync(this.rootDir + '/ennube.yaml', this.config);
    };
    Object.defineProperty(Project.prototype, "name", {
        get: function () {
            return this.package.name;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Project.prototype, "buildDir", {
        get: function () {
            return this.tsconfig.compilerOptions.outDir;
        },
        enumerable: true,
        configurable: true
    });
    return Project;
}());
exports.Project = Project;
var Shell = (function () {
    function Shell() {
    }
    return Shell;
}());
exports.Shell = Shell;
;
var Command = (function () {
    function Command(shell, project) {
        this.shell = shell;
        this.project = project;
    }
    Command.register = function (name, help) {
        return function (command) {
            Command.all[name] = {
                help: help,
                command: command
            };
            return command;
        };
    };
    Command.prototype.describe = function (yargs) {
        return yargs;
    };
    Command.all = {};
    return Command;
}());
exports.Command = Command;
var Step = (function () {
    function Step(name) {
        this.name = name;
    }
    Step.prototype.toString = function () {
        return this.name;
    };
    Step.prototype.insertBefore = function (step) {
        step.previusStep = this.previusStep;
        step.task = this.task;
        if (this.previusStep === undefined)
            this.task.firstStep = step;
        this.previusStep = step;
    };
    Step.prototype.insertAfter = function (step) {
        step.nextStep = this.nextStep;
        step.task = this.task;
        if (this.nextStep === undefined)
            this.task.lastStep = step;
        this.nextStep = step;
    };
    return Step;
}());
exports.Step = Step;
var Task = (function (_super) {
    __extends(Task, _super);
    function Task() {
        _super.apply(this, arguments);
    }
    Task.prototype.appendStep = function (childStep) {
        childStep.task = this;
        childStep.previusStep = this.lastStep;
        if (this.lastStep === undefined)
            this.firstStep = childStep;
        else
            this.lastStep.nextStep = childStep;
        this.lastStep = childStep;
    };
    Task.prototype.prependStep = function (childStep) {
        childStep.task = this;
        childStep.nextStep = this.firstStep;
        if (this.firstStep === undefined)
            this.lastStep = childStep;
        else
            this.firstStep.previusStep = childStep;
        this.firstStep = childStep;
    };
    Task.prototype.stepCount = function () {
        var stepCount = 0;
        var step = this.firstStep;
        while (step !== undefined) {
            stepCount += 1;
            step = step.nextStep;
        }
        return stepCount;
    };
    return Task;
}(Step));
exports.Task = Task;
var SerialTask = (function (_super) {
    __extends(SerialTask, _super);
    function SerialTask() {
        _super.apply(this, arguments);
    }
    SerialTask.prototype.perform = function () {
        var _this = this;
        if (!this.task)
            console.log(this.toString());
        return new es6_promise_1.Promise(function (resolve, reject) {
            var step = _this.firstStep;
            var run = function () {
                if (step === undefined)
                    return resolve();
                console.log(step.toString());
                step
                    .perform()
                    .catch(function (e) { return reject(e); })
                    .then(function () {
                    step = step.nextStep;
                    console.log('OK');
                    run();
                });
            };
            run();
        });
    };
    return SerialTask;
}(Task));
exports.SerialTask = SerialTask;
var ParallelTask = (function (_super) {
    __extends(ParallelTask, _super);
    function ParallelTask() {
        _super.apply(this, arguments);
    }
    ParallelTask.prototype.perform = function () {
        var _this = this;
        if (!this.task)
            console.log(this.toString() + " parallel");
        return new es6_promise_1.Promise(function (resolve, reject) {
            var stepCount = _this.stepCount();
            var completedSteps = 0;
            var step = _this.firstStep;
            while (step !== undefined) {
                step.perform()
                    .catch(function (e) { return reject(e); })
                    .then(function () {
                    completedSteps += 1;
                    if (completedSteps >= stepCount)
                        resolve();
                });
                step = step.nextStep;
            }
        });
    };
    return ParallelTask;
}(Task));
exports.ParallelTask = ParallelTask;
//# sourceMappingURL=core.js.map