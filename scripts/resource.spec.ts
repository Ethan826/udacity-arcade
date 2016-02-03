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
      let i = new Image();

      beforeEach((done) => {
        i.src = URL1;
        i.onload = () => { done(); }
      });

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

      it("can retrieve images", () => {
        let rc = new ResourceCache([URL1], () => {});
        expect(i).toEqual(rc.getImage(URL1));
      });
    });
  }

  run = () => {
    this.tests();
  }
}
