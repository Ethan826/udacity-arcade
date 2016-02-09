/// <reference path="./engine.ts"/>
import {CANVAS_CONSTANTS} from "./engine";
import {ResourceCache} from "./resource";

interface Location {
  x: number;
  y: number;
}

interface EntityDimensions {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

/* Avoid globals and problems with loading sequence by having the App class
 * manage the Engine class in a single point of entry.
 */
export class App {
  private player: Player;
  private topEnemy: EnemyBug;
  private middleEnemy: EnemyBug;
  private bottomEnemy: EnemyBug;

  constructor(private rc: ResourceCache, private ctx: CanvasRenderingContext2D) {
    this.player = new Player(this.ctx, this.rc.getImage("images/char-boy.png"));
    this.topEnemy = new EnemyBug(this.ctx, this.rc.getImage("images/enemy-bug.png"), 2);
    this.middleEnemy = new EnemyBug(this.ctx, this.rc.getImage("images/enemy-bug.png"), 3);
    this.bottomEnemy = new EnemyBug(this.ctx, this.rc.getImage("images/enemy-bug.png"), 4);
  }

  render() {
    this.player.render();
    this.topEnemy.render();
    this.middleEnemy.render();
    this.bottomEnemy.render();
  }
}

interface IEntity {
  update: (dt: number) => void;
  render: () => void;
}

abstract class Entity implements IEntity {
  protected location: Location;
  protected dimensions: EntityDimensions;

  constructor(
    private ctx: CanvasRenderingContext2D,
    private sprite: HTMLImageElement) { }

  abstract update(dt: number): void;

  render() {
    let spriteWidth = this.dimensions.endX - this.dimensions.startX;
    let spriteHeight = this.dimensions.endY - this.dimensions.startY;
    this.ctx.drawImage(
      this.sprite, // Image source
      this.dimensions.startX, // Source X start
      this.dimensions.startY, // Source Y start
      spriteWidth, // Source width
      spriteHeight, // Source height
      this.location.x - Math.floor(spriteWidth / 2), // Destination X start
      this.location.y - Math.floor(spriteHeight / 2), // Destination Y start
      spriteWidth, // Destination width
      spriteHeight // Destination height
      );
  }
}

class EnemyBug extends Entity {

  constructor(ctx: CanvasRenderingContext2D, sprite: HTMLImageElement, private rowNum: number) {
    super(ctx, sprite);

    this.dimensions = {
      startX: 1,
      startY: 75,
      endX: 99,
      endY: 144
    }

    this.location = {
      x: 0,
      y: CANVAS_CONSTANTS.rowHeight * rowNum // Why not centered?
    }
  }

  update(dt: number) { }
}

class Player extends Entity {

  constructor(ctx: CanvasRenderingContext2D, sprite: HTMLImageElement) {
    /* The initial position is in the middle, halfway up the bottom row. */
    super(ctx, sprite);

    this.dimensions = {
      startX: 16,
      startY: 62,
      endX: 84,
      endY: 140
    }

    this.location = {
      x: CANVAS_CONSTANTS.canvasWidth / 2,
      y: Math.floor(CANVAS_CONSTANTS.rowHeight * CANVAS_CONSTANTS.numRows)
    };
  }

  update(dt: number) { };

  handleInput() { };

}
