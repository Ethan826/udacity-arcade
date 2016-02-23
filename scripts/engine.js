define(["require", "exports", "./resource", "./app"], function (require, exports, resource_1, app_1) {
    "use strict";
    /* Read app.js and app.ts first; it is more fully commented. */
    (function (Difficulty) {
        Difficulty[Difficulty["easy"] = 0] = "easy";
        Difficulty[Difficulty["medium"] = 1] = "medium";
        Difficulty[Difficulty["hard"] = 2] = "hard";
    })(exports.Difficulty || (exports.Difficulty = {}));
    var Difficulty = exports.Difficulty;
    /* Avoid magic constants, permit changing the canvas at a single point. */
    exports.CANVAS_CONSTANTS = {
        numCols: 5,
        numRows: 6,
        colWidth: 101,
        rowHeight: 83,
        canvasWidth: 505,
        canvasHeight: 606
    };
    var Engine = (function () {
        /* The class constructor handles the preloading of images and the work of the
         * init() function as it was previously implemented.
         */
        function Engine(canvasConstants, difficulty) {
            var _this = this;
            this.difficulty = difficulty;
            /* Constants */
            this.IMAGE_LOCATIONS = {
                water: "images/water-block.png",
                stone: "images/stone-block.png",
                grass: "images/grass-block.png",
                enemy: "images/enemy-bug.png",
                char: "images/char-boy.png"
            };
            /* This array is a map of the rows. */
            this.ROW_MAP = [
                this.IMAGE_LOCATIONS.water,
                this.IMAGE_LOCATIONS.stone,
                this.IMAGE_LOCATIONS.stone,
                this.IMAGE_LOCATIONS.stone,
                this.IMAGE_LOCATIONS.grass,
                this.IMAGE_LOCATIONS.grass
            ];
            this.main = function () {
                var gameCondition = _this.app.getGameCondition();
                if (gameCondition === app_1.GameConditions.inProgress) {
                    _this.now = Date.now();
                    var dt = (_this.now - _this.lastTime) / 1000.0;
                    /* I contemplated replacing this.LastTime two calls to Date.now()
                     * But using two variables is more than ten times faster than calling
                     * Date.now() twice. https://jsfiddle.net/1643q9qv/1/
                     */
                    _this.lastTime = _this.now;
                    _this.update(dt);
                    _this.render();
                    _this.app.render();
                }
                if (gameCondition === app_1.GameConditions.won) {
                    _this.handleWin();
                }
                else if (gameCondition === app_1.GameConditions.lost) {
                    _this.handleLoss();
                }
                window.requestAnimationFrame(_this.main);
            };
            /* Set up the canvas */
            this.CANVAS_CONSTANTS = canvasConstants;
            if (this.CANVAS_CONSTANTS.numRows !== this.ROW_MAP.length) {
                throw "Mismatch between numRows and rows in ROW_MAP";
            }
            this.canvas = document.createElement("canvas");
            this.canvas.width = canvasConstants.canvasWidth;
            this.canvas.height = canvasConstants.canvasHeight;
            document.body.appendChild(this.canvas);
            this.ctx = this.canvas.getContext("2d");
            /* Create the argument for the images passed into the ResourceCache
             * constructor programatically, to permit refactoring of file locations at
             * a single point.
             */
            var images = [];
            for (var image in this.IMAGE_LOCATIONS) {
                if (this.IMAGE_LOCATIONS.hasOwnProperty(image)) {
                    images.push(this.IMAGE_LOCATIONS[image]);
                }
            }
            /* Create an instance of ResourceCache and set the the callback (this
             * replaces the init() method in the original.
             */
            this.rc = new resource_1.ResourceCache(images, function () {
                _this.lastTime = Date.now();
                _this.app = new app_1.App(_this.rc, _this.ctx, _this.difficulty);
                _this.main();
            });
        }
        Engine.prototype.update = function (dt) {
            this.app.update(dt);
        };
        Engine.prototype.render = function () {
            var _this = this;
            /* By storing the map of what goes in each row in a constant, by pulling
             * the file locations from another constant, and by relying on constants to
             * store the information about the dimensions of the playing area, this
             * function's semantics are a lot clearer.
             */
            this.ctx.clearRect(0, 0, exports.CANVAS_CONSTANTS.canvasWidth, exports.CANVAS_CONSTANTS.canvasHeight);
            this.ROW_MAP.forEach(function (rowContents, rowIndex) {
                for (var colIndex = 0; colIndex < _this.CANVAS_CONSTANTS.numCols; ++colIndex) {
                    _this.ctx.drawImage(_this.rc.getImage(rowContents), colIndex * _this.CANVAS_CONSTANTS.colWidth, rowIndex * _this.CANVAS_CONSTANTS.rowHeight);
                }
            });
        };
        Engine.prototype.renderEntities = function () {
            this.app.render();
        };
        Engine.prototype.handleWin = function () {
            this.ctx.beginPath();
            this.ctx.rect(0, 0, this.CANVAS_CONSTANTS.canvasWidth, this.CANVAS_CONSTANTS.canvasHeight);
            this.ctx.fillStyle = "green";
            this.ctx.fill();
            this.ctx.font = "50px Helvetica";
            this.ctx.fillStyle = "white";
            this.ctx.textAlign = "center";
            this.ctx.fillText("You Win!", exports.CANVAS_CONSTANTS.canvasWidth / 2, exports.CANVAS_CONSTANTS.canvasHeight / 2);
            /* There might be a better way to do this, but since everything gets
             * reloaded anyway, this simply displays the You Win! message for three
             * seconds, then reloads the page. The page should be cached.
             */
            window.setTimeout(function () { location.reload(); }, 3000);
        };
        Engine.prototype.handleLoss = function () {
            this.ctx.beginPath();
            this.ctx.rect(0, 0, this.CANVAS_CONSTANTS.canvasWidth, this.CANVAS_CONSTANTS.canvasHeight);
            this.ctx.fillStyle = "red";
            this.ctx.fill();
            this.ctx.font = "50px Helvetica";
            this.ctx.fillStyle = "white";
            this.ctx.textAlign = "center";
            this.ctx.fillText("You Lose!", exports.CANVAS_CONSTANTS.canvasWidth / 2, exports.CANVAS_CONSTANTS.canvasHeight / 2);
            window.setTimeout(function () { location.reload(); }, 3000);
        };
        return Engine;
    }());
    exports.Engine = Engine;
    /* This actually runs the game. */
    (function () {
        var before = "<h1>Difficulty</h1><br>\n<button id=\"easy\">Easy</button>&nbsp;\n<button id=\"medium\">Medium</button>&nbsp;\n<button id=\"hard\">Hard</button>";
        $("#input").html(before);
        $("body").find("*").off();
        $("#input").html(before);
        $("#easy").click(function () {
            $("#input").hide();
            var engine = new Engine(exports.CANVAS_CONSTANTS, Difficulty.easy);
        });
        $("#medium").click(function () {
            $("#input").hide();
            var engine = new Engine(exports.CANVAS_CONSTANTS, Difficulty.medium);
        });
        $("#hard").click(function () {
            $("#input").hide();
            var engine = new Engine(exports.CANVAS_CONSTANTS, Difficulty.hard);
        });
    }());
});
