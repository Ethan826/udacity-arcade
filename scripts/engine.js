define(["require", "exports", "./resource"], function (require, exports, resource_1) {
    "use strict";
    var Engine = (function () {
        /* The class constructor handles the preloading of images and the work of the
         * init() function as it was previously implemented.
         */
        function Engine() {
            var _this = this;
            /* The constants in the original were scattered throughout the file; here I
             * have combined them for readability and to allow changes at a single point.
             */
            this.IMAGE_LOCATIONS = {
                water: "images/water-block.png",
                stone: "images/stone-block.png",
                grass: "images/grass-block.png",
                enemy: "images/enemy-bug.png",
                char: "images/char-boy.png"
            };
            this.ROW_MAP = [
                this.IMAGE_LOCATIONS.water,
                this.IMAGE_LOCATIONS.stone,
                this.IMAGE_LOCATIONS.stone,
                this.IMAGE_LOCATIONS.stone,
                this.IMAGE_LOCATIONS.grass,
                this.IMAGE_LOCATIONS.grass
            ];
            this.NUM_COLS = 5;
            this.COL_WIDTH = 101;
            this.ROW_HEIGHT = 83;
            this.CANVAS_WIDTH = 505;
            this.CANVAS_HEIGHT = 606;
            this.canvas = document.createElement("canvas");
            this.ctx = this.canvas.getContext("2d");
            /* Set up the canvas */
            this.canvas.width = this.CANVAS_WIDTH;
            this.canvas.height = this.CANVAS_HEIGHT;
            document.body.appendChild(this.canvas);
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
             * replaces the init() method in the original
             */
            this.rc = new resource_1.ResourceCache(images, function () {
                _this.lastTime = Date.now();
                _this.main();
            });
        }
        Engine.prototype.main = function () {
            this.render();
        };
        Engine.prototype.render = function () {
            var _this = this;
            /* By storing the map of what goes in each row in a constant, by pulling
             * the file locations from another constant, and by relying on constants to
             * store the information about the dimensions of the playing area, this
             * function's semantics are a lot clearer.
             */
            this.ROW_MAP.forEach(function (rowContents, rowIndex) {
                for (var colIndex = 0; colIndex < _this.NUM_COLS; ++colIndex) {
                    _this.ctx.drawImage(_this.rc.getImage(rowContents), colIndex * _this.COL_WIDTH, rowIndex * _this.ROW_HEIGHT);
                }
            });
        };
        return Engine;
    }());
    exports.Engine = Engine;
});
