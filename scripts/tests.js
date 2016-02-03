define(["require", "exports", "./resource.spec", "./engine.spec"], function (require, exports, resource_spec_1, engine_spec_1) {
    "use strict";
    var resource = new resource_spec_1.Tests();
    var engine = new engine_spec_1.Tests();
    resource.run();
    engine.run();
    // https://www.stevefenton.co.uk/2014/07/combining-typescript-jasmine-and-amd-with-requirejs/
    jasmine.getEnv().execute();
});
