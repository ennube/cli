"use strict";
var child_process = require('child_process');
var Builder = (function () {
    function Builder(project) {
        this.project = project;
    }
    Builder.prototype.build = function () {
        return new Promise(function (resolve, reject) {
            child_process.exec('tsc', function (err, stdout, stderr) {
                if (err)
                    reject(stderr);
                else
                    resolve(stdout);
            });
        });
    };
    return Builder;
}());
exports.Builder = Builder;
//# sourceMappingURL=builder.js.map