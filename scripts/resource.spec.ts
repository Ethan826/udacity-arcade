/// <reference path="../typings/requirejs/require.d.ts"/>
/// <reference path="../typings/jasmine/jasmine.d.ts"/>

import {ResourceCache} from "./resource";

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
                expect(() => { this.rc.load([3,4,5]) }).toThrow();
            });
        });
    }

    run = () => {
        this.testsForLoad();
    }
}
