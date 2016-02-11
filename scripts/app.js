var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "./engine"], function (require, exports, engine_1) {
    "use strict";
    var ArrowKeys;
    (function (ArrowKeys) {
        ArrowKeys[ArrowKeys["left"] = 0] = "left";
        ArrowKeys[ArrowKeys["up"] = 1] = "up";
        ArrowKeys[ArrowKeys["right"] = 2] = "right";
        ArrowKeys[ArrowKeys["down"] = 3] = "down";
    })(ArrowKeys || (ArrowKeys = {}));
    /* Avoid globals and problems with loading sequence by having the App class
     * manage the Engine class in a single point of entry.
     */
    var App = (function () {
        function App(rc, ctx) {
            this.rc = rc;
            this.ctx = ctx;
            var player = new Player(this.ctx, this.rc.getImage("images/char-boy.png"));
            var topEnemy = new EnemyBug(this.ctx, this.rc.getImage("images/enemy-bug.png"), 2);
            var middleEnemy = new EnemyBug(this.ctx, this.rc.getImage("images/enemy-bug.png"), 3);
            var bottomEnemy = new EnemyBug(this.ctx, this.rc.getImage("images/enemy-bug.png"), 4);
            this.entities = [player, topEnemy, middleEnemy, bottomEnemy];
        }
        App.prototype.render = function () {
            this.entities.forEach(function (entity) {
                entity.render();
            });
        };
        App.prototype.update = function (dt) {
            this.entities.forEach(function (entity) {
                entity.update(dt);
            });
        };
        return App;
    }());
    exports.App = App;
    var Entity = (function () {
        function Entity(ctx, sprite) {
            this.ctx = ctx;
            this.sprite = sprite;
        }
        Entity.prototype.render = function () {
            var spriteWidth = this.dimensions.endX - this.dimensions.startX;
            var spriteHeight = this.dimensions.endY - this.dimensions.startY;
            this.ctx.drawImage(this.sprite, // Image source
            this.dimensions.startX, // Source X start
            this.dimensions.startY, // Source Y start
            spriteWidth, // Source width
            spriteHeight, // Source height
            this.location.x - Math.floor(spriteWidth / 2), // Destination X start
            this.location.y - Math.floor(spriteHeight / 2), // Destination Y start
            spriteWidth, // Destination width
            spriteHeight // Destination height
            );
        };
        return Entity;
    }());
    var EnemyBug = (function (_super) {
        __extends(EnemyBug, _super);
        function EnemyBug(ctx, sprite, rowNum) {
            _super.call(this, ctx, sprite);
            this.rowNum = rowNum;
            this.speed = Math.random() * 400 + 100;
            this.dimensions = {
                startX: 1,
                startY: 75,
                endX: 99,
                endY: 144
            };
            this.location = {
                x: 0,
                y: engine_1.CANVAS_CONSTANTS.rowHeight * rowNum
            };
        }
        EnemyBug.prototype.update = function (dt) {
            this.location.x += dt * this.speed;
            if (this.location.x - this.sprite.width > engine_1.CANVAS_CONSTANTS.canvasWidth) {
                this.location.x = this.location.x - Math.floor(1.1 * engine_1.CANVAS_CONSTANTS.canvasWidth) - this.sprite.width;
            }
        };
        return EnemyBug;
    }(Entity));
    var Player = (function (_super) {
        __extends(Player, _super);
        function Player(ctx, sprite) {
            var _this = this;
            _super.call(this, ctx, sprite);
            this.KEY_CONSTANTS = {
                37: ArrowKeys.left,
                38: ArrowKeys.up,
                39: ArrowKeys.right,
                40: ArrowKeys.down
            };
            document.addEventListener('keyup', function (e) {
                _this.handleInput(_this.KEY_CONSTANTS[e.keyCode]);
            });
            this.dimensions = {
                startX: 16,
                startY: 62,
                endX: 84,
                endY: 140
            };
            /* The initial position is in the middle, halfway up the bottom row. */
            this.location = {
                x: engine_1.CANVAS_CONSTANTS.canvasWidth / 2,
                y: Math.floor(engine_1.CANVAS_CONSTANTS.rowHeight * engine_1.CANVAS_CONSTANTS.numRows)
            };
        }
        Player.prototype.update = function (dt) {
        };
        Player.prototype.handleInput = function (e) {
        };
        return Player;
    }(Entity));
});
