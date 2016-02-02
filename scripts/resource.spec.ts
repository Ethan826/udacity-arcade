/// <reference path="../typings/requirejs/require.d.ts"/>
/// <reference path="../typings/jasmine/jasmine.d.ts"/>

import {ResourceCache} from "./resource";

let URL1 = "images/char-boy.png";
let URL2 = "images/char-cat-girl.png";

/**
* In order to centralize testing into a single test.ts / test.js file, all tests
* are declared as private class methods, each of which wraps a Jasmine
* function. The class then exposes a single run() method, which calls all of
* the unexecuted test functions.
*/
export class Tests {

  private tests = () => {
    return describe("Tests for ResourceCache", () => {
      it("allows creation of an instance of ResourceCache", () => {
        expect(() => {
          new ResourceCache([URL1], () => { });
        })
          .not.toThrow();
        expect(() => {
          new ResourceCache([URL1, URL2], () => { });
        })
          .not.toThrow();
        expect(() => {
          new ResourceCache("foo", () => { });
        })
          .toThrow();
      });

      it("calls the callback method", () => {
        let image = new Image();
        image.src = URL1;
        image.onload = () => {
          console.log(image);
        };
        let rc = new ResourceCache([URL1], () => {
          rc.getImage(URL1);
        });
      });
      //it("", () => {});
    });
  }

  run = () => {
    this.tests();
  }
}
