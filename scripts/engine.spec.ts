/// <reference path="../typings/jasmine/jasmine.d.ts"/>

import {Engine} from "./engine";

export class Tests {

  private tests = () => {
    return describe("Tests for Engine", () => {
      it("Can create a new Engine", () => {
        expect(() => { new Engine() }).not.toThrow();
      });
      // it("", () => { });
    });
  }

  run = () => {
    this.tests();
  }
}
