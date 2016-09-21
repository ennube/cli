"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var index_1 = require('./index');
var change_case_1 = require('change-case');
var Commands = (function (_super) {
    __extends(Commands, _super);
    function Commands() {
        _super.apply(this, arguments);
    }
    Commands.prototype.deploy = function (args) {
        console.log(this.project.name + " will storm the sky");
        var providerClass = change_case_1.pascalCase(args.provider);
        var builder = new index_1.Builder(this.project);
        var packager = new index_1.Packager(this.project);
        var provider = new index_1.providers[providerClass](this.project);
        Promise.resolve()
            .then(function () { return builder.build(); })
            .then(function () { return packager.packup(); })
            .then(function () { return provider.ensure(); })
            .then(function () { return provider.upload(); })
            .then(function () { return provider.update(); })
            .then(function () { return console.log('\nDeployment completed'); });
    };
    __decorate([
        index_1.command('deploys the application', function (yargs) { return yargs
            .option('stage', { default: 'development' })
            .option('provider', { default: 'amazon' })
            .boolean('dry'); }), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [Object]), 
        __metadata('design:returntype', void 0)
    ], Commands.prototype, "deploy", null);
    return Commands;
}(index_1.CommandService));
//# sourceMappingURL=commands.js.map