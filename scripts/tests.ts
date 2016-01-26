import {Tests as resourceSpec} from "./resource.spec";

let resource = new resourceSpec();

resource.run();

// https://www.stevefenton.co.uk/2014/07/combining-typescript-jasmine-and-amd-with-requirejs/
jasmine.getEnv().execute();
