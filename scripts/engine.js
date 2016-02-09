define(["require", "exports", "./resource", "./app"], function (require, exports, resource_1, app_1) {
    "use strict";
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
        function Engine(canvasConstants) {
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
                _this.app = new app_1.App(_this.rc, _this.ctx);
                _this.main();
            });
            // FOR TESTING
        }
        Engine.prototype.main = function () {
            this.now = Date.now();
            var dt = (this.now - this.lastTime) / 1000.0;
            /* I contemplated replacing this.LastTime two calls to Date.now()
             * But using two variables is about ten times faster than calling
             * Date.now() twice. https://jsfiddle.net/1643q9qv/1/
             */
            this.lastTime = this.now;
            this.update(dt);
            this.render();
            this.app.render();
            window.requestAnimationFrame(this.main);
        };
        Engine.prototype.update = function (dt) { };
        //   private updateEntites(dt: number) {
        //       allEnemies.forEach(() => {});
        //   }
        Engine.prototype.render = function () {
            var _this = this;
            /* By storing the map of what goes in each row in a constant, by pulling
             * the file locations from another constant, and by relying on constants to
             * store the information about the dimensions of the playing area, this
             * function's semantics are a lot clearer.
             */
            console.log("Level: " + Date.now());
            this.ROW_MAP.forEach(function (rowContents, rowIndex) {
                for (var colIndex = 0; colIndex < _this.CANVAS_CONSTANTS.numCols; ++colIndex) {
                    _this.ctx.drawImage(_this.rc.getImage(rowContents), colIndex * _this.CANVAS_CONSTANTS.colWidth, rowIndex * _this.CANVAS_CONSTANTS.rowHeight);
                }
            });
        };
        Engine.prototype.renderEntities = function () {
            this.app.render();
        };
        return Engine;
    }());
    exports.Engine = Engine;
    var engine = new Engine(exports.CANVAS_CONSTANTS);
});
