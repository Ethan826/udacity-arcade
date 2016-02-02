define(["require", "exports", "./resource.spec"], function (require, exports, resource_spec_1) {
    "use strict";
    var resource = new resource_spec_1.Tests();
    resource.run();
    // https://www.stevefenton.co.uk/2014/07/combining-typescript-jasmine-and-amd-with-requirejs/
    jasmine.getEnv().execute();
});
