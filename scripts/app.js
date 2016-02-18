var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "./engine"], function (require, exports, engine_1) {
    "use strict";
    var EntityType;
    (function (EntityType) {
        EntityType[EntityType["player"] = 0] = "player";
        EntityType[EntityType["enemy"] = 1] = "enemy";
    })(EntityType || (EntityType = {}));
    var ArrowKeys;
    (function (ArrowKeys) {
        ArrowKeys[ArrowKeys["left"] = 0] = "left";
        ArrowKeys[ArrowKeys["up"] = 1] = "up";
        ArrowKeys[ArrowKeys["right"] = 2] = "right";
        ArrowKeys[ArrowKeys["down"] = 3] = "down";
    })(ArrowKeys || (ArrowKeys = {}));
    (function (GameConditions) {
        GameConditions[GameConditions["inProgress"] = 0] = "inProgress";
        GameConditions[GameConditions["won"] = 1] = "won";
        GameConditions[GameConditions["lost"] = 2] = "lost";
    })(exports.GameConditions || (exports.GameConditions = {}));
    var GameConditions = exports.GameConditions;
    var KEY_CONSTANTS = {
        37: ArrowKeys.left,
        38: ArrowKeys.up,
        39: ArrowKeys.right,
        40: ArrowKeys.down
    };
    /* Avoid globals and problems with loading sequence by having the Engine class
     * manage the App class in a single point of entry.
     */
    var App = (function () {
        function App(rc, ctx) {
            this.rc = rc;
            this.ctx = ctx;
            this.gameCondition = GameConditions.inProgress;
            var player = new Player(this.ctx, this.rc.getImage("images/char-boy.png"));
            var topEnemy = new EnemyBug(this.ctx, this.rc.getImage("images/enemy-bug.png"), 2);
            var middleEnemy = new EnemyBug(this.ctx, this.rc.getImage("images/enemy-bug.png"), 3);
            var bottomEnemy = new EnemyBug(this.ctx, this.rc.getImage("images/enemy-bug.png"), 4);
            this.entities = [player, topEnemy, middleEnemy, bottomEnemy];
            this.playerIndex = 0;
        }
        App.prototype.getGameCondition = function () {
            return this.gameCondition;
        };
        App.prototype.render = function () {
            this.entities.forEach(function (entity) {
                entity.render();
            });
        };
        App.prototype.update = function (dt) {
            var _this = this;
            this.entities.forEach(function (entity) {
                entity.update(dt);
                if (_this.checkCollisions()) {
                    _this.gameCondition = GameConditions.lost;
                }
                if (_this.checkWin()) {
                    _this.gameCondition = GameConditions.won;
                }
                ;
            });
        };
        App.prototype.checkCollisions = function () {
            var _this = this;
            var coll = false;
            var player = this.entities[this.playerIndex];
            this.entities.forEach(function (entity) {
                if (entity.entityType !== EntityType.player) {
                    if (_this.collisionHelper(player, entity)) {
                        coll = true;
                    }
                }
            });
            return coll;
        };
        App.prototype.checkWin = function () {
            var player = this.entities[this.playerIndex];
            var playerCoords = this.getCoords(player);
            return playerCoords.startY <= engine_1.CANVAS_CONSTANTS.rowHeight / 2 ? true : false;
        };
        App.prototype.getCoords = function (entity) {
            var entityHalfWidth = (entity.dimensions.endX - entity.dimensions.startX) / 2;
            var entityHalfHeight = (entity.dimensions.endY - entity.dimensions.startY) / 2;
            return {
                startX: entity.location.x - entityHalfWidth,
                endX: entity.location.x + entityHalfWidth,
                startY: entity.location.y - entityHalfHeight,
                endY: entity.location.y + entityHalfHeight
            };
        };
        App.prototype.collisionHelper = function (e1, e2) {
            var e1Coords = this.getCoords(e1);
            var e2Coords = this.getCoords(e2);
            var isEntirelyRight = e1Coords.startX > e2Coords.endX;
            var isEntirelyLeft = e1Coords.endX < e2Coords.startX;
            var isEntirelyAbove = e1Coords.endY < e2Coords.startY;
            var isEntirelyBelow = e1Coords.startY > e2Coords.endY;
            return isEntirelyLeft || isEntirelyRight || isEntirelyAbove || isEntirelyBelow ? false : true;
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
            this.entityType = EntityType.enemy;
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
    var Keyboard = (function () {
        function Keyboard() {
            var _this = this;
            this.downKeys = {
                left: false,
                up: false,
                right: false,
                down: false
            };
            window.addEventListener("keydown", function (e) {
                _this.downKeys[ArrowKeys[KEY_CONSTANTS[e.keyCode]]] = true;
            });
            window.addEventListener("keyup", function (e) {
                _this.downKeys[ArrowKeys[KEY_CONSTANTS[e.keyCode]]] = false;
            });
        }
        Keyboard.prototype.isDown = function (key) {
            return this.downKeys[ArrowKeys[key]];
        };
        return Keyboard;
    }());
    var Player = (function (_super) {
        __extends(Player, _super);
        function Player(ctx, sprite) {
            _super.call(this, ctx, sprite);
            this.entityType = EntityType.player;
            this.keyboard = new Keyboard();
            this.speed = 150;
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
            if (this.keyboard.isDown(ArrowKeys.left)) {
                this.location.x -= this.speed * dt;
            }
            if (this.keyboard.isDown(ArrowKeys.up)) {
                this.location.y -= this.speed * dt;
            }
            if (this.keyboard.isDown(ArrowKeys.right)) {
                this.location.x += this.speed * dt;
            }
            if (this.keyboard.isDown(ArrowKeys.down)) {
                this.location.y += this.speed * dt;
            }
        };
        return Player;
    }(Entity));
});
