var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "./engine"], function (require, exports, engine_1) {
    "use strict";
    /* The enum implementation in TypeScript compiles to this code in JavaScript.
     * The EntityType enum lets an Entity (which is an abstract class implemented
     * by Player and Enemy) to keep track of its type without using reflection.
     * This could be expanded to other entities like tokens, coins, other players,
     * other enemies, etc.
     */
    var EntityType;
    (function (EntityType) {
        EntityType[EntityType["player"] = 0] = "player";
        EntityType[EntityType["enemy"] = 1] = "enemy";
    })(EntityType || (EntityType = {}));
    /* The ArrowKeys enum assists in keyboard inputs for Player. */
    var ArrowKeys;
    (function (ArrowKeys) {
        ArrowKeys[ArrowKeys["left"] = 0] = "left";
        ArrowKeys[ArrowKeys["up"] = 1] = "up";
        ArrowKeys[ArrowKeys["right"] = 2] = "right";
        ArrowKeys[ArrowKeys["down"] = 3] = "down";
    })(ArrowKeys || (ArrowKeys = {}));
    /* The GameConditions enum is used by the main loop. */
    (function (GameConditions) {
        GameConditions[GameConditions["inProgress"] = 0] = "inProgress";
        GameConditions[GameConditions["won"] = 1] = "won";
        GameConditions[GameConditions["lost"] = 2] = "lost";
    })(exports.GameConditions || (exports.GameConditions = {}));
    var GameConditions = exports.GameConditions;
    /* This avoids magic constants in the code. */
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
        /* App manages the ResourceCache, the entities, the difficulty level, and
         * holds a reference to the context for rendering.
         */
        function App(rc, ctx, difficulty) {
            this.rc = rc;
            this.ctx = ctx;
            this.difficulty = difficulty;
            this.gameCondition = GameConditions.inProgress;
            /* Entities takes the context, the image, an initial position, and the
             * difficulty level.
             */
            var player = new Player(this.ctx, this.rc.getImage("images/char-boy.png"), {
                x: engine_1.CANVAS_CONSTANTS.canvasWidth / 2,
                y: Math.floor(engine_1.CANVAS_CONSTANTS.rowHeight * engine_1.CANVAS_CONSTANTS.numRows)
            }, this.difficulty);
            var topEnemy = new EnemyBug(this.ctx, this.rc.getImage("images/enemy-bug.png"), { x: 0, y: engine_1.CANVAS_CONSTANTS.rowHeight * 2 }, this.difficulty);
            var middleEnemy = new EnemyBug(this.ctx, this.rc.getImage("images/enemy-bug.png"), { x: 0, y: engine_1.CANVAS_CONSTANTS.rowHeight * 3 }, this.difficulty);
            var bottomEnemy = new EnemyBug(this.ctx, this.rc.getImage("images/enemy-bug.png"), { x: 0, y: engine_1.CANVAS_CONSTANTS.rowHeight * 4 }, this.difficulty);
            /* After creating the entities, put them in the array of entities. */
            this.entities = [player, topEnemy, middleEnemy, bottomEnemy];
            /* playerIndex tracks the array index for the Player. */
            this.playerIndex = 0;
            /* The entities' sprites are bigger than the visible portion of the images.
             * Each entity holds its own coordinates for the visible portion of the
             * images. The playerBounds define the portion of the canvas that the
             * player can occupy. The middle of the Player can't actually go to the
             * edge of the canvas, so this logic keeps track of how close to the edge
             * the player can go. The keepPlayerInBounds() method uses this.
             */
            var halfDimensions = this.getHalfDimensions(player);
            this.playerBounds = {
                startX: halfDimensions.x,
                endX: engine_1.CANVAS_CONSTANTS.canvasWidth - halfDimensions.x,
                startY: halfDimensions.y,
                endY: (engine_1.CANVAS_CONSTANTS.numRows + 0.5) * engine_1.CANVAS_CONSTANTS.rowHeight - halfDimensions.y
            };
        }
        /* Getter method. */
        App.prototype.getGameCondition = function () {
            return this.gameCondition;
        };
        /* Loop through the entities and call each entity's render method. */
        App.prototype.render = function () {
            this.entities.forEach(function (entity) {
                entity.render();
            });
        };
        /* Loop through the entities and call each entity's update method. */
        App.prototype.update = function (dt) {
            var _this = this;
            this.entities.forEach(function (entity) {
                entity.update(dt);
                /* Do some checks: if the loop is on Player, make sure the player is in
                 * bounds. Check for collisions. Then see if the game is won or lost.
                 */
                if (entity.entityType === EntityType.player) {
                    _this.keepPlayerInBounds(entity);
                }
                if (_this.checkCollisions()) {
                    _this.gameCondition = GameConditions.lost;
                }
                if (_this.checkWin()) {
                    _this.gameCondition = GameConditions.won;
                }
            });
        };
        /* If the Player would be outside of the canvas bounds following the update()
         * method, put the player on the edge.
         */
        App.prototype.keepPlayerInBounds = function (entity) {
            var player = this.entities[this.playerIndex];
            if (player.coords.x < this.playerBounds.startX) {
                player.position({ x: this.playerBounds.startX, y: player.coords.y });
            }
            if (player.coords.x > this.playerBounds.endX) {
                player.position({ x: this.playerBounds.endX, y: player.coords.y });
            }
            if (player.coords.y > this.playerBounds.endY) {
                player.position({ x: player.coords.x, y: this.playerBounds.endY });
            }
            if (player.coords.y < this.playerBounds.startY) {
                player.position({ x: player.coords.x, y: this.playerBounds.startY });
            }
        };
        /* Loops through the entities, skipping over the Player. Checks to see if the
         * Player has collided with any of the entities.
         */
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
        /* Determine if the player has gone to the top of the screen */
        App.prototype.checkWin = function () {
            var player = this.entities[this.playerIndex];
            var playerRectangleCoords = this.getRectangleCoords(player);
            return playerRectangleCoords.startY <= engine_1.CANVAS_CONSTANTS.rowHeight / 2 ? true : false;
        };
        /* The entity's half dimensions are used for the radius in the collision
         * logic, the keepPlayerInBounds() logic, and the edges of the entity given
         * its point coordinates.
         */
        App.prototype.getHalfDimensions = function (entity) {
            var entityHalfWidth = (entity.dimensions.endX - entity.dimensions.startX) / 2;
            var entityHalfHeight = (entity.dimensions.endY - entity.dimensions.startY) / 2;
            return { x: entityHalfWidth, y: entityHalfHeight };
        };
        /* Given an entity's point coordinates, return its boundaries. */
        App.prototype.getRectangleCoords = function (entity) {
            var halfDimensions = this.getHalfDimensions(entity);
            return {
                startX: entity.coords.x - halfDimensions.x,
                endX: entity.coords.x + halfDimensions.x,
                startY: entity.coords.y - halfDimensions.y,
                endY: entity.coords.y + halfDimensions.y
            };
        };
        /* Given two entities, return true if they have collided. */
        App.prototype.collisionHelper = function (e1, e2) {
            // https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
            var dx = e1.coords.x - e2.coords.x;
            var dy = e1.coords.y - e2.coords.y;
            var distance = Math.sqrt(dx * dx + dy * dy);
            return distance < e1.radius + e2.radius ? true : false;
        };
        return App;
    }());
    exports.App = App;
    /* TypeScript permits abstract classes. The Entity class is implemented by
     * the Enemy and Player classes.
     */
    var Entity = (function () {
        function Entity(ctx, sprite, coords) {
            this.ctx = ctx;
            this.sprite = sprite;
            this.coords = coords;
        }
        /* getRadius() uses 0.8 as a hack to avoid non-round sprites from colliding
         * too easily.
         */
        Entity.prototype.getRadius = function () {
            return 0.8 * Math.max(this.dimensions.endX - this.dimensions.startX, this.dimensions.endY - this.dimensions.startY) / 2;
        };
        Entity.prototype.render = function () {
            var spriteWidth = this.dimensions.endX - this.dimensions.startX;
            var spriteHeight = this.dimensions.endY - this.dimensions.startY;
            this.ctx.drawImage(this.sprite, // Image source
            this.dimensions.startX, // Source X start
            this.dimensions.startY, // Source Y start
            spriteWidth, // Source width
            spriteHeight, // Source height
            this.coords.x - spriteWidth / 2, // Destination X start
            this.coords.y - spriteHeight / 2, // Destination Y start
            spriteWidth, // Destination width
            spriteHeight // Destination height
            );
        };
        return Entity;
    }());
    /* This is how TypeScript handles implementing the abstract class Entity.
     */
    var EnemyBug = (function (_super) {
        __extends(EnemyBug, _super);
        function EnemyBug(ctx, sprite, coords, difficulty) {
            _super.call(this, ctx, sprite, coords);
            this.entityType = EntityType.enemy;
            this.dimensions = {
                startX: 1,
                startY: 75,
                endX: 99,
                endY: 144
            };
            this.radius = this.getRadius();
            /* The higher the difficulty setting, the faster the enemy. */
            if (difficulty == engine_1.Difficulty.easy) {
                this.speed = Math.random() * 200 + 100;
            }
            else if (difficulty == engine_1.Difficulty.medium) {
                this.speed = Math.random() * 300 + 100;
            }
            else {
                this.speed = Math.random() * 400 + 100;
            }
        }
        EnemyBug.prototype.update = function (dt) {
            this.coords.x += dt * this.speed;
            /* The 1.1 multiplier is to let the bug get fully off screen before cycling
             * back to the start.
             */
            if (this.coords.x - this.sprite.width > engine_1.CANVAS_CONSTANTS.canvasWidth) {
                this.coords.x = this.coords.x - Math.floor(1.1 * engine_1.CANVAS_CONSTANTS.canvasWidth) - this.sprite.width;
            }
        };
        return EnemyBug;
    }(Entity));
    /* Keyboard handles key inputs for Player. */
    var Keyboard = (function () {
        // http://nokarma.org/2011/02/27/javascript-game-development-keyboard-input/
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
        function Player(ctx, sprite, coords, difficulty) {
            _super.call(this, ctx, sprite, coords);
            this.entityType = EntityType.player;
            this.keyboard = new Keyboard();
            this.speed = 150;
            this.dimensions = {
                startX: 16,
                startY: 62,
                endX: 84,
                endY: 140
            };
            this.radius = this.getRadius();
            /* Player gets slower with increasing difficulty. */
            if (difficulty == engine_1.Difficulty.easy) {
                this.speed = 200;
            }
            else if (difficulty == engine_1.Difficulty.medium) {
                this.speed = 150;
            }
            else {
                this.speed = 100;
            }
        }
        Player.prototype.update = function (dt) {
            if (this.keyboard.isDown(ArrowKeys.left)) {
                this.coords.x -= this.speed * dt;
            }
            if (this.keyboard.isDown(ArrowKeys.up)) {
                this.coords.y -= this.speed * dt;
            }
            if (this.keyboard.isDown(ArrowKeys.right)) {
                this.coords.x += this.speed * dt;
            }
            if (this.keyboard.isDown(ArrowKeys.down)) {
                this.coords.y += this.speed * dt;
            }
        };
        Player.prototype.position = function (coords) {
            this.coords = coords;
        };
        return Player;
    }(Entity));
});
