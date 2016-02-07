/// <reference path="./engine.ts"/>
import {CANVAS_CONSTANTS} from "./engine";
import {ResourceCache} from "./resource";

interface Location {
  x: number;
  y: number;
}

/* Avoid globals and problems with loading sequence by having the App class
 * manage the Engine class in a single point of entry.
 */
export class App {
  private ctx: CanvasRenderingContext2D;
  private player: Player;


  constructor(private rc: ResourceCache) {
    /* Bad loose coupling here. Hmm. */
    this.player = new Player(this.ctx, this.rc.getImage("images/char-boy.png"));
  }

  render() {
    this.player.render();
  }
}

interface Entity {
  update: (dt: number) => void;
  render: (ctx: CanvasRenderingContext2D) => void;
}

class Enemy implements Entity {
  private location: Location;

  constructor(private ctx: CanvasRenderingContext2D, private sprite: HTMLImageElement) { }

  update(dt: number) { }

  render() {
    this.ctx.drawImage(this.sprite, this.location.x, this.location.y);
  }
}

class Player implements Entity {
  private location: Location;

  constructor(private ctx: CanvasRenderingContext2D, private sprite: HTMLImageElement) {
    /* The initial position is in the middle, halfway up the bottom row. */
    this.location = {
      x: CANVAS_CONSTANTS.canvasWidth / 2,
      y: Math.floor(CANVAS_CONSTANTS.rowHeight * (CANVAS_CONSTANTS.numRows + 0.5))
    };
  }

  update(dt: number) { };

  render() {
    this.ctx.drawImage(this.sprite, this.location.x, this.location.y);
  };

  handleInput() { };

}
