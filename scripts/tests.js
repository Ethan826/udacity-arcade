(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", "./resource.spec"], factory);
    }
})(function (require, exports) {
    "use strict";
    var resource_spec_1 = require("./resource.spec");
    var resource = new resource_spec_1.Tests();
    resource.run();
    // https://www.stevefenton.co.uk/2014/07/combining-typescript-jasmine-and-amd-with-requirejs/
    jasmine.getEnv().execute();
});
