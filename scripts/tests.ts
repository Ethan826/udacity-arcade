import {Tests as resourceSpec} from "./resource.spec";
import {Tests as engineSpec} from "./engine.spec";

let resource = new resourceSpec();
let engine = new engineSpec();

resource.run();
engine.run();

// https://www.stevefenton.co.uk/2014/07/combining-typescript-jasmine-and-amd-with-requirejs/
jasmine.getEnv().execute();
