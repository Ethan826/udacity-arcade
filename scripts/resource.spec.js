/// <reference path="../typings/jasmine/jasmine.d.ts"/>
define(["require", "exports", "./resource"], function (require, exports, resource_1) {
    "use strict";
    var URL1 = "images/char-boy.png";
    var URL2 = "images/char-cat-girl.png";
    /**
    * In order to centralize testing into a single test.ts / test.js file, all tests
    * are declared as private class methods, each of which wraps a Jasmine
    * function. The class then exposes a single run() method, which calls all of
    * the unexecuted test functions.
    */
    var Tests = (function () {
        function Tests() {
            var _this = this;
            this.tests = function () {
                return describe("Tests for ResourceCache", function () {
                    var i = new Image();
                    beforeEach(function (done) {
                        i.src = URL1;
                        i.onload = function () { done(); };
                    });
                    it("allows creation of an instance of ResourceCache", function () {
                        expect(function () {
                            new resource_1.ResourceCache([URL1], function () { });
                        })
                            .not.toThrow();
                        expect(function () {
                            new resource_1.ResourceCache([URL1, URL2], function () { });
                        })
                            .not.toThrow();
                        expect(function () {
                            new resource_1.ResourceCache("foo", function () { });
                        })
                            .toThrow();
                    });
                    it("can retrieve images", function () {
                        var rc = new resource_1.ResourceCache([URL1], function () { });
                        expect(i).toEqual(rc.getImage(URL1));
                    });
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
