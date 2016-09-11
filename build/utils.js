"use strict";
var es6_promise_1 = require('es6-promise');
var fs = require('fs');
var yaml = require('js-yaml');
var archiver = require('archiver');
function readJsonSync(filename) {
    if (!fs.existsSync(filename))
        return null;
    return JSON.parse(fs.readFileSync(filename, 'utf8')) || {};
}
exports.readJsonSync = readJsonSync;
function writeJsonSync(filename, data) {
    fs.writeFileSync(filename, JSON.stringify(data));
}
exports.writeJsonSync = writeJsonSync;
function readYamlSync(filename) {
    if (!fs.existsSync(filename))
        return null;
    return yaml.safeLoad(fs.readFileSync(filename, 'utf8')) || {};
}
exports.readYamlSync = readYamlSync;
function writeYamlSync(filename, data) {
    fs.writeFileSync(filename, yaml.safeDump(data));
}
exports.writeYamlSync = writeYamlSync;
function zipDirectory(directory, output) {
    return new es6_promise_1.Promise(function (resolve, reject) {
        output = output || directory + ".zip";
        var outFile = fs.createWriteStream(output);
        var archive = archiver.create('zip', {});
        outFile.on('close', function () { return resolve(output); });
        archive.on('error', function (error) { return reject(error); });
        archive.pipe(outFile);
        archive.directory(directory, '/', {});
        archive.finalize();
    });
}
exports.zipDirectory = zipDirectory;
//# sourceMappingURL=utils.js.map