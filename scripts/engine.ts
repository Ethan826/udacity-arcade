import {ResourceCache} from "./resource";
import {App} from "./app"

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
  private NUM_COLS = 5;
  private COL_WIDTH = 101;
  private ROW_HEIGHT = 83;
  private CANVAS_WIDTH = 505;
  private CANVAS_HEIGHT = 606;

  /* Variables */
  private rc: ResourceCache;
  private app = new App();
  private canvas = document.createElement("canvas");
  private ctx = this.canvas.getContext("2d");
  private now: number;
  private lastTime: number;
  private dt: number;

  /* The class constructor handles the preloading of images and the work of the
   * init() function as it was previously implemented.
   */
  constructor() {
    /* Set up the canvas */
    this.canvas.width = this.CANVAS_WIDTH;
    this.canvas.height = this.CANVAS_HEIGHT;
    document.body.appendChild(this.canvas);

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
      this.main();
    });
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

    /* Is this recursive? Or is the
     */
    window.requestAnimationFrame(this.main);
  }

  private update(dt: number) {
  }

//   private updateEntites(dt: number) {
//       allEnemies.forEach(() => {});
//   }

  private render() {
    /* By storing the map of what goes in each row in a constant, by pulling
     * the file locations from another constant, and by relying on constants to
     * store the information about the dimensions of the playing area, this
     * function's semantics are a lot clearer.
     */
    this.ROW_MAP.forEach((rowContents, rowIndex) => {
      for (let colIndex = 0; colIndex < this.NUM_COLS; ++colIndex) {
        this.ctx.drawImage(
          this.rc.getImage(rowContents),
          colIndex * this.COL_WIDTH,
          rowIndex * this.ROW_HEIGHT
          );
      }
    });
  }
}

let engine = new Engine();
