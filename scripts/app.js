/// <reference path="./engine.ts"/>
define(["require", "exports"], function (require, exports) {
    "use strict";
    /* Avoid globals and problems with loading sequence by having the App class
     * manage the Engine class in a single point of entry.
     */
    var App = (function () {
        function App() {
        }
        return App;
    }());
    exports.App = App;
    var Enemy = (function () {
        function Enemy(ctx, sprite) {
            this.ctx = ctx;
            this.sprite = sprite;
        }
        Enemy.prototype.update = function (dt) { };
        Enemy.prototype.render = function (ctx) {
            this.ctx.drawImage(this.sprite, this.location.x, this.location.y);
        };
        return Enemy;
    }());
    var Player = (function () {
        function Player() {
        }
        Player.prototype.update = function (dt) { };
        ;
        Player.prototype.render = function () { };
        ;
        Player.prototype.handleInput = function () { };
        ;
        return Player;
    }());
});
