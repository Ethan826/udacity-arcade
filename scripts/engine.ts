import {ResourceCache} from "./resource";
import {App} from "./app"

interface CanvasConstants {
  numCols: number;
  numRows: number;
  colWidth: number;
  rowHeight: number;
  canvasWidth: number;
  canvasHeight: number;
}

export let CANVAS_CONSTANTS: CanvasConstants = {
  numCols: 5,
  numRows: 6,
  colWidth: 101,
  rowHeight: 83,
  canvasWidth: 505,
  canvasHeight: 606
}

export class Engine {
  /* The constants in the original were scattered throughout the file; here I
   * have combined them for readability and to allow changes at a single point.
   */
  private IMAGE_LOCATIONS = {
    water: "images/water-block.png",
    stone: "images/stone-block.png",
    grass: "images/grass-block.png",
    enemy: "images/enemy-bug.png",
    char: "images/char-boy.png"
  };
  private ROW_MAP = [
    this.IMAGE_LOCATIONS.water,
    this.IMAGE_LOCATIONS.stone,
    this.IMAGE_LOCATIONS.stone,
    this.IMAGE_LOCATIONS.stone,
    this.IMAGE_LOCATIONS.grass,
    this.IMAGE_LOCATIONS.grass
  ];
  private CANVAS_CONSTANTS: CanvasConstants;

  /* Variables */
  private rc: ResourceCache;
  private app: App;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private now: number;
  private lastTime: number;
  private dt: number;

  /* The class constructor handles the preloading of images and the work of the
   * init() function as it was previously implemented.
   */
  constructor(canvasConstants: CanvasConstants) {
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
    let images: string[] = [];
    for (let image in this.IMAGE_LOCATIONS) {
      if (this.IMAGE_LOCATIONS.hasOwnProperty(image)) {
        images.push(this.IMAGE_LOCATIONS[image]);
      }
    }

    /* Create an instance of ResourceCache and set the the callback (this
     * replaces the init() method in the original.
     */
    this.rc = new ResourceCache(images, () => {
      this.lastTime = Date.now();
      this.app = new App(this.rc, this.ctx);
      this.main();
    });
    // FOR TESTING
  }

  private main() {
    this.now = Date.now();
    let dt = (this.now - this.lastTime) / 1000.0;

    /* I contemplated replacing this.LastTime two calls to Date.now()
     * But using two variables is about ten times faster than calling
     * Date.now() twice. https://jsfiddle.net/1643q9qv/1/
     */
    this.lastTime = this.now;
    this.update(dt);
    this.render();
    this.app.render();

    window.requestAnimationFrame(this.main);
  }

  private update(dt: number) { }

  //   private updateEntites(dt: number) {
  //       allEnemies.forEach(() => {});
  //   }

  private render() {
    /* By storing the map of what goes in each row in a constant, by pulling
     * the file locations from another constant, and by relying on constants to
     * store the information about the dimensions of the playing area, this
     * function's semantics are a lot clearer.
     */
    console.log("Level: " + Date.now());
    this.ROW_MAP.forEach((rowContents, rowIndex) => {
      for (let colIndex = 0; colIndex < this.CANVAS_CONSTANTS.numCols; ++colIndex) {
        this.ctx.drawImage(
          this.rc.getImage(rowContents),
          colIndex * this.CANVAS_CONSTANTS.colWidth,
          rowIndex * this.CANVAS_CONSTANTS.rowHeight
          );
      }
    });
  }

  private renderEntities() {
    this.app.render();
  }
}

let engine = new Engine(CANVAS_CONSTANTS);
