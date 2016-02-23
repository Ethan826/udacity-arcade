/// <reference path="../typings/jquery/jquery.d.ts"/>
import {ResourceCache} from "./resource";
import {App, GameConditions} from "./app"

interface CanvasConstants {
  numCols: number;
  numRows: number;
  colWidth: number;
  rowHeight: number;
  canvasWidth: number;
  canvasHeight: number;
}

/* Read app.js and app.ts first; it is more fully commented. */
export enum Difficulty {
  easy,
  medium,
  hard
}

/* Avoid magic constants, permit changing the canvas at a single point. */
export let CANVAS_CONSTANTS: CanvasConstants = {
  numCols: 5,
  numRows: 6,
  colWidth: 101,
  rowHeight: 83,
  canvasWidth: 505,
  canvasHeight: 606
}

export class Engine {
  /* Constants */
  private IMAGE_LOCATIONS = {
    water: "images/water-block.png",
    stone: "images/stone-block.png",
    grass: "images/grass-block.png",
    enemy: "images/enemy-bug.png",
    char: "images/char-boy.png"
  };

  /* This array is a map of the rows. */
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
  constructor(canvasConstants: CanvasConstants, private difficulty: Difficulty) {
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
      this.app = new App(this.rc, this.ctx, this.difficulty);
      this.main();
    });
  }

  private main = () => {
    let gameCondition = this.app.getGameCondition();
    if (gameCondition === GameConditions.inProgress) {
      this.now = Date.now();
      let dt = (this.now - this.lastTime) / 1000.0;

      /* I contemplated replacing this.LastTime two calls to Date.now()
       * But using two variables is more than ten times faster than calling
       * Date.now() twice. https://jsfiddle.net/1643q9qv/1/
       */
      this.lastTime = this.now;
      this.update(dt);
      this.render();
      this.app.render();
    }

    if (gameCondition === GameConditions.won) {
      this.handleWin();
    }
    else if (gameCondition === GameConditions.lost) {
      this.handleLoss();
    }

    window.requestAnimationFrame(this.main);
  }

  private update(dt: number) {
    this.app.update(dt);
  }

  private render() {
    /* By storing the map of what goes in each row in a constant, by pulling
     * the file locations from another constant, and by relying on constants to
     * store the information about the dimensions of the playing area, this
     * function's semantics are a lot clearer.
     */
    this.ctx.clearRect(0, 0, CANVAS_CONSTANTS.canvasWidth, CANVAS_CONSTANTS.canvasHeight)
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

  private handleWin() {
    this.ctx.beginPath();
    this.ctx.rect(0, 0, this.CANVAS_CONSTANTS.canvasWidth, this.CANVAS_CONSTANTS.canvasHeight);
    this.ctx.fillStyle = "green";
    this.ctx.fill();
    this.ctx.font = "50px Helvetica";
    this.ctx.fillStyle = "white";
    this.ctx.textAlign = "center";
    this.ctx.fillText("You Win!", CANVAS_CONSTANTS.canvasWidth / 2, CANVAS_CONSTANTS.canvasHeight / 2);

    /* There might be a better way to do this, but since everything gets
     * reloaded anyway, this simply displays the You Win! message for three
     * seconds, then reloads the page. The page should be cached.
     */
    window.setTimeout(() => { location.reload(); }, 3000);
  }

  private handleLoss() {
    this.ctx.beginPath();
    this.ctx.rect(0, 0, this.CANVAS_CONSTANTS.canvasWidth, this.CANVAS_CONSTANTS.canvasHeight);
    this.ctx.fillStyle = "red";
    this.ctx.fill();
    this.ctx.font = "50px Helvetica";
    this.ctx.fillStyle = "white";
    this.ctx.textAlign = "center";
    this.ctx.fillText("You Lose!", CANVAS_CONSTANTS.canvasWidth / 2, CANVAS_CONSTANTS.canvasHeight / 2);
    window.setTimeout(() => { location.reload(); }, 3000);
  }
}

/* This actually runs the game. */
(function() {
  let before = `<h1>Difficulty</h1><br>
<button id="easy">Easy</button>&nbsp;
<button id="medium">Medium</button>&nbsp;
<button id="hard">Hard</button>`;
  $("#input").html(before);
  $("body").find("*").off();
  $("#input").html(before);
  $("#easy").click(() => {
    $("#input").hide();
    let engine = new Engine(CANVAS_CONSTANTS, Difficulty.easy);
  });
  $("#medium").click(() => {
    $("#input").hide();
    let engine = new Engine(CANVAS_CONSTANTS, Difficulty.medium);
  });
  $("#hard").click(() => {
    $("#input").hide();
    let engine = new Engine(CANVAS_CONSTANTS, Difficulty.hard);
  });
} ());
