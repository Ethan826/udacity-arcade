define(["require", "exports", "./engine"], function (require, exports, engine_1) {
    "use strict";
    /* Avoid globals and problems with loading sequence by having the App class
     * manage the Engine class in a single point of entry.
     */
    var App = (function () {
        function App(rc) {
            this.rc = rc;
            /* Bad loose coupling here. Hmm. */
            this.player = new Player(this.ctx, this.rc.getImage("images/char-boy.png"));
        }
        App.prototype.render = function () {
            this.player.render();
        };
        return App;
    }());
    exports.App = App;
    var Enemy = (function () {
        function Enemy(ctx, sprite) {
            this.ctx = ctx;
            this.sprite = sprite;
        }
        Enemy.prototype.update = function (dt) { };
        Enemy.prototype.render = function () {
            this.ctx.drawImage(this.sprite, this.location.x, this.location.y);
        };
        return Enemy;
    }());
    var Player = (function () {
        function Player(ctx, sprite) {
            this.ctx = ctx;
            this.sprite = sprite;
            /* The initial position is in the middle, halfway up the bottom row. */
            this.location = {
                x: engine_1.CANVAS_CONSTANTS.canvasWidth / 2,
                y: Math.floor(engine_1.CANVAS_CONSTANTS.rowHeight * (engine_1.CANVAS_CONSTANTS.numRows + 0.5))
            };
        }
        Player.prototype.update = function (dt) { };
        ;
        Player.prototype.render = function () {
            this.ctx.drawImage(this.sprite, this.location.x, this.location.y);
        };
        ;
        Player.prototype.handleInput = function () { };
        ;
        return Player;
    }());
});
