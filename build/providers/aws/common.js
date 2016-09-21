"use strict";
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
        this.resources = {};
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
    function Resource(stack) {
        this.stack = stack;
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
//# sourceMappingURL=common.js.map