(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    var ResourceCache = (function () {
        function ResourceCache() {
            var _this = this;
            this.resourceCache = {};
            this.getResourceCache = function () {
                return _this.resourceCache;
            };
            this.load = function (urlOrArray) {
                if (typeof urlOrArray === "string") {
                    _this.loadHelper(urlOrArray);
                }
                else if (typeof urlOrArray === "object") {
                    console.log(_this.isArrayOfStrings(urlOrArray));
                    if (_this.isArrayOfStrings(urlOrArray)) {
                        urlOrArray.forEach(function (st) {
                            _this.loadHelper(st);
                        });
                    }
                    else {
                        throw "load() accepts a string or array of strings";
                    }
                }
                else {
                    throw "load() accepts a string or array of strings";
                }
            };
        }
        ResourceCache.prototype.loadHelper = function (url) {
            this.resourceCache[url] = new Image();
        };
        ResourceCache.prototype.isArrayOfStrings = function (value) {
            var result = true;
            value.forEach(function (val) {
                if (typeof val !== "string") {
                    result = false; // Could optimize by returning here but it doesn't work (???)
                }
            });
            return result;
        };
        return ResourceCache;
    }());
    exports.ResourceCache = ResourceCache;
});
