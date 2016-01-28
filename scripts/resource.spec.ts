/// <reference path="../typings/requirejs/require.d.ts"/>
/// <reference path="../typings/jasmine/jasmine.d.ts"/>

import {ResourceCache} from "./resource";

let URL1 = "../images/char-boy.png";
let URL2 = "../images/char-cat-girl.png";

export class Tests {
  private rc = new ResourceCache();

  private testsForLoad = () => {
    return describe("Tests for load()", () => {
      it("accepts a string", () => {
        expect(() => { this.rc.load("Foo") }).not.toThrow();
      });
      it("accepts an array of strings", () => {
        expect(() => { this.rc.load(["Foo", "Bar"]) }).not.toThrow();
      });
      it("errors with a number", () => {
        expect(() => { this.rc.load(3) }).toThrow();
      });
      it("errors with an array of numbers", () => {
        expect(() => { this.rc.load([3, 4, 5]) }).toThrow();
      });
      it("loads a single image fresh", () => {
        let localRC = new ResourceCache();
        localRC.load(URL1);
        let img = localRC.getResourceCache()[URL1];
        expect(img).toEqual(new Image()); // This isn't correctly implemented yet.
      });
      //it("", () => {});
    });
  }

  run = () => {
    this.testsForLoad();
  }
}
