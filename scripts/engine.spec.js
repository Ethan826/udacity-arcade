/// <reference path="../typings/jasmine/jasmine.d.ts"/>
define(["require", "exports", "./engine"], function (require, exports, engine_1) {
    "use strict";
    var Tests = (function () {
        function Tests() {
            var _this = this;
            this.tests = function () {
                return describe("Tests for Engine", function () {
                    it("Can create a new Engine", function () {
                        expect(function () { new engine_1.Engine(); }).not.toThrow();
                    });
                    // it("", () => { });
                });
            };
            this.run = function () {
                _this.tests();
            };
        }
        return Tests;
    }());
    exports.Tests = Tests;
});
