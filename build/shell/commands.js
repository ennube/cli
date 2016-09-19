"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var index_1 = require('../index');
var Commands = (function () {
    function Commands() {
    }
    Commands.prototype.deploy = function (args) {
    };
    __decorate([
        index_1.command('deploys the application', function (yargs) { return yargs
            .option('stage', { default: 'development' })
            .boolean('dry'); })
    ], Commands.prototype, "deploy", null);
    return Commands;
}());
//# sourceMappingURL=commands.js.map