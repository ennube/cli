"use strict";
var change_case_1 = require('change-case');
function getStackName(projectName, stage) {
    return change_case_1.pascalCase(projectName) + "-" + change_case_1.pascalCase(stage);
}
exports.getStackName = getStackName;
function ref(id) {
    return { Ref: id };
}
exports.ref = ref;
function getAtt(id, attr) {
    return { "Fn::GetAtt": [id, attr] };
}
exports.getAtt = getAtt;
function fnJoin() {
    var params = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        params[_i - 0] = arguments[_i];
    }
    return { "Fn::Join": params };
}
exports.fnJoin = fnJoin;
function mixin() {
    var baseClasses = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        baseClasses[_i - 0] = arguments[_i];
    }
    return function (targetClass) {
        for (var _i = 0, baseClasses_1 = baseClasses; _i < baseClasses_1.length; _i++) {
            var baseClass = baseClasses_1[_i];
            for (var _a = 0, _b = Object.getOwnPropertyNames(baseClass.prototype); _a < _b.length; _a++) {
                var property = _b[_a];
                targetClass.prototype[property] = baseClass.prototype[property];
            }
        }
    };
}
exports.mixin = mixin;
var fn;
(function (fn) {
    function ref(id) {
        return { Ref: id };
    }
    fn.ref = ref;
    function getAtt(targetId, attr) {
        return { "Fn::GetAtt": [targetId, attr] };
    }
    fn.getAtt = getAtt;
    function join(delimitier) {
        var params = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            params[_i - 1] = arguments[_i];
        }
        return { "Fn::Join": [delimitier, params] };
    }
    fn.join = join;
})(fn = exports.fn || (exports.fn = {}));
var Stack = (function () {
    function Stack(region, stage) {
        this.region = region;
        this.stage = stage;
    }
    Object.defineProperty(Stack.prototype, "template", {
        get: function () {
            return {};
        },
        enumerable: true,
        configurable: true
    });
    return Stack;
}());
var Resource = (function () {
    function Resource(stack, parent) {
        this.stack = stack;
        this.parent = parent;
    }
    Object.defineProperty(Resource.prototype, "id", {
        get: function () { },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Resource.prototype, "type", {
        get: function () { },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Resource.prototype, "metadata", {
        get: function () { },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Resource.prototype, "dependsOn", {
        get: function () { },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Resource.prototype, "properties", {
        get: function () { },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Resource.prototype, "ref", {
        get: function () {
            return { 'Ref': this.id };
        },
        enumerable: true,
        configurable: true
    });
    Resource.prototype.getAtt = function (att) {
        return { 'Fn::getAtt': [this.id, att] };
    };
    return Resource;
}());
function send(request) {
    return new Promise(function (resolve, reject) {
        request()
            .on('success', function (response) { return resolve(response); })
            .on('error', function (response) { return reject(response); })
            .send();
    });
}
exports.send = send;
//# sourceMappingURL=common.js.map