/// <reference path="../typings/requirejs/require.d.ts"/>
/// <reference path="../typings/jasmine/jasmine.d.ts"/>
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", "./resource"], factory);
    }
})(function (require, exports) {
    "use strict";
    var resource_1 = require("./resource");
    var URL1 = "../images/char-boy.png";
    var URL2 = "../images/char-cat-girl.png";
    var Tests = (function () {
        function Tests() {
            var _this = this;
            this.rc = new resource_1.ResourceCache();
            this.testsForLoad = function () {
                return describe("Tests for load()", function () {
                    it("accepts a string", function () {
                        expect(function () { _this.rc.load("Foo"); }).not.toThrow();
                    });
                    it("accepts an array of strings", function () {
                        expect(function () { _this.rc.load(["Foo", "Bar"]); }).not.toThrow();
                    });
                    it("errors with a number", function () {
                        expect(function () { _this.rc.load(3); }).toThrow();
                    });
                    it("errors with an array of numbers", function () {
                        expect(function () { _this.rc.load([3, 4, 5]); }).toThrow();
                    });
                    it("loads a single image fresh", function () {
                        var localRC = new resource_1.ResourceCache();
                        localRC.load(URL1);
                        var img = localRC.getResourceCache()[URL1];
                        expect(img).toEqual(new Image()); // This isn't correctly implemented yet.
                    });
                    //it("", () => {});
                });
            };
            this.run = function () {
                _this.testsForLoad();
            };
        }
        return Tests;
    }());
    exports.Tests = Tests;
});
