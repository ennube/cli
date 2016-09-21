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
var project_1 = require('./project');
var builder_1 = require('./builder');
var amazon_1 = require('./providers/amazon');
var Provider = (function () {
    function Provider(shell) {
        this.shell = shell;
    }
    Provider.prototype.deploy = function (shell, project, builder) {
        var amazon = new amazon_1.Amazon(project);
        return Promise.resolve()
            .then(function () { return builder.build(shell, project); })
            .then(function () { return amazon.ensurePrepared(); })
            .then(function () { return amazon.uploadDeploymentFiles(); })
            .then(function () { return amazon.updateStack(shell); });
    };
    __decorate([
        shell_1.command('deploy'), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [shell_1.Shell, project_1.Project, builder_1.Builder]), 
        __metadata('design:returntype', void 0)
    ], Provider.prototype, "deploy", null);
    return Provider;
}());
exports.Provider = Provider;
//# sourceMappingURL=provider.js.map