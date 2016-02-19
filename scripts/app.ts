/// <reference path="./engine.ts"/>
import {CANVAS_CONSTANTS} from "./engine";
import {ResourceCache} from "./resource";

interface Coords {
  x: number;
  y: number;
}

interface RectangleCoords {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

enum EntityType {
  player,
  enemy
}

enum ArrowKeys {
  left,
  up,
  right,
  down
}

export enum GameConditions {
  inProgress,
  won,
  lost
}

let KEY_CONSTANTS = {
  37: ArrowKeys.left,
  38: ArrowKeys.up,
  39: ArrowKeys.right,
  40: ArrowKeys.down
}

/* Avoid globals and problems with loading sequence by having the Engine class
 * manage the App class in a single point of entry.
 */
export class App {
  private entities: Entity[];
  private playerIndex: number;
  private gameCondition = GameConditions.inProgress;
  private playerBounds: RectangleCoords;

  constructor(private rc: ResourceCache, private ctx: CanvasRenderingContext2D) {
    let player = new Player(
      this.ctx,
      this.rc.getImage("images/char-boy.png"),
      {
        x: CANVAS_CONSTANTS.canvasWidth / 2,
        y: Math.floor(CANVAS_CONSTANTS.rowHeight * CANVAS_CONSTANTS.numRows)
      }
      );
    // let topEnemy = new EnemyBug(
    //   this.ctx,
    //   this.rc.getImage("images/enemy-bug.png"),
    //   { x: 0, y: CANVAS_CONSTANTS.rowHeight * 2 }
    //   );
    // let middleEnemy = new EnemyBug(
    //   this.ctx,
    //   this.rc.getImage("images/enemy-bug.png"),
    //   { x: 0, y: CANVAS_CONSTANTS.rowHeight * 3 }
    //   );
    let bottomEnemy = new EnemyBug(
      this.ctx,
      this.rc.getImage("images/enemy-bug.png"),
      { x: 0, y: CANVAS_CONSTANTS.rowHeight * 4 });
    this.entities = [player, /*topEnemy, middleEnemy,*/ bottomEnemy];
    this.playerIndex = 0;

    let halfDimensions = this.getHalfDimensions(player);
    this.playerBounds = {
      startX: halfDimensions.x,
      endX: CANVAS_CONSTANTS.canvasWidth - halfDimensions.x,
      startY: halfDimensions.y,
      endY: (CANVAS_CONSTANTS.numRows + 0.5) * CANVAS_CONSTANTS.rowHeight - halfDimensions.y
    }
  }

  getGameCondition() {
    return this.gameCondition;
  }

  render() {
    this.entities.forEach((entity) => {
      entity.render();
    });
  }

  update(dt: number) {
    this.entities.forEach((entity) => {
      entity.update(dt);
      if (entity.entityType === EntityType.player) {
        this.keepPlayerInBounds(entity as Player);
      }
      if (this.checkCollisions()) { this.gameCondition = GameConditions.lost; }
      if (this.checkWin()) { this.gameCondition = GameConditions.won; };
    });
  }

  private keepPlayerInBounds(entity: Player) {
    let player = this.entities[this.playerIndex] as Player;
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
  }

  private checkCollisions() { // TODO: This needs to account for the sprite's non-rectangular shape
    let coll = false;
    let player = this.entities[this.playerIndex];
    this.entities.forEach((entity) => { // Could also work based on indices
      if (entity.entityType !== EntityType.player) {
        if (this.collisionHelper(player, entity)) {
          coll = true;
        }
      }
    });
    return coll;
  }

  private checkWin() {
    let player = this.entities[this.playerIndex];
    let playerRectangleCoords = this.getRectangleCoords(player);
    return playerRectangleCoords.startY <= CANVAS_CONSTANTS.rowHeight / 2 ? true : false;
  }

  private getHalfDimensions(entity: Entity): Coords {
    let entityHalfWidth = (entity.dimensions.endX - entity.dimensions.startX) / 2;
    let entityHalfHeight = (entity.dimensions.endY - entity.dimensions.startY) / 2;
    return { x: entityHalfWidth, y: entityHalfHeight }
  }

  private getRectangleCoords(entity: Entity): RectangleCoords {
    let halfDimensions = this.getHalfDimensions(entity);
    return {
      startX: entity.coords.x - halfDimensions.x,
      endX: entity.coords.x + halfDimensions.x,
      startY: entity.coords.y - halfDimensions.y,
      endY: entity.coords.y + halfDimensions.y
    };
  }

  private collisionHelper(e1: Entity, e2: Entity): boolean {
    // https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
    let dx = e1.coords.x - e2.coords.x;
    let dy = e1.coords.y - e2.coords.y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    return distance < e1.radius + e2.radius ? true : false;
  }

  /* Rectangular collision helper
  // private collisionHelper(e1: Entity, e2: Entity): boolean {
  //   let e1RectangleCoords = this.getRectangleCoords(e1);
  //   let e2RectangleCoords = this.getRectangleCoords(e2);
  //   let isEntirelyRight = e1RectangleCoords.startX > e2RectangleCoords.endX;
  //   let isEntirelyLeft = e1RectangleCoords.endX < e2RectangleCoords.startX;
  //   let isEntirelyAbove = e1RectangleCoords.endY < e2RectangleCoords.startY;
  //   let isEntirelyBelow = e1RectangleCoords.startY > e2RectangleCoords.endY;
  //   return isEntirelyLeft || isEntirelyRight || isEntirelyAbove || isEntirelyBelow ? false : true;
  // }*/
}

interface IEntity {
  update: (dt: number) => void;
  render: () => void;
  entityType: EntityType;
  dimensions: RectangleCoords;
  radius: number;
}

abstract class Entity implements IEntity {
  dimensions: RectangleCoords;
  entityType: EntityType;
  radius: number;

  constructor(
    protected ctx: CanvasRenderingContext2D,
    protected sprite: HTMLImageElement,
    public coords: Coords) {
  }

  abstract update(dt: number): void;

  protected getRadius(): number {
    return Math.max(
      this.dimensions.endX - this.dimensions.startX,
      this.dimensions.endY - this.dimensions.startY) / 2;
  }

  render() {
    let spriteWidth = this.dimensions.endX - this.dimensions.startX;
    let spriteHeight = this.dimensions.endY - this.dimensions.startY;
    this.ctx.drawImage(
      this.sprite, // Image source
      this.dimensions.startX, // Source X start
      this.dimensions.startY, // Source Y start
      spriteWidth, // Source width
      spriteHeight, // Source height
      this.coords.x - spriteWidth / 2, // Destination X start
      this.coords.y - spriteHeight / 2, // Destination Y start
      spriteWidth, // Destination width
      spriteHeight // Destination height
      );
  }
}

class EnemyBug extends Entity {
  private speed = Math.random() * 400 + 100;
  entityType = EntityType.enemy;
  dimensions = {
    startX: 1,
    startY: 75,
    endX: 99,
    endY: 144
  }

  constructor(ctx: CanvasRenderingContext2D, sprite: HTMLImageElement, coords: Coords) {
    super(ctx, sprite, coords);
    this.radius = this.getRadius();
  }

  update(dt: number) {
    this.coords.x += dt * this.speed;
    if (this.coords.x - this.sprite.width > CANVAS_CONSTANTS.canvasWidth) {
      this.coords.x = this.coords.x - Math.floor(1.1 * CANVAS_CONSTANTS.canvasWidth) - this.sprite.width;
    }
  }
}

class Keyboard {
  private downKeys = {
    left: false,
    up: false,
    right: false,
    down: false
  }

  constructor() {
    window.addEventListener("keydown", (e: KeyboardEvent) => {
      this.downKeys[ArrowKeys[KEY_CONSTANTS[e.keyCode]]] = true;
    });
    window.addEventListener("keyup", (e: KeyboardEvent) => {
      this.downKeys[ArrowKeys[KEY_CONSTANTS[e.keyCode]]] = false;
    });
  }

  isDown(key: ArrowKeys): boolean {
    return this.downKeys[ArrowKeys[key]];
  }
}

class Player extends Entity {
  entityType = EntityType.player;

  private keyboard = new Keyboard();
  private speed = 150;
  dimensions = {
    startX: 16,
    startY: 62,
    endX: 84,
    endY: 140
  }

  constructor(ctx: CanvasRenderingContext2D, sprite: HTMLImageElement, coords: Coords) {
    super(ctx, sprite, coords);
    this.radius = this.getRadius();
  }

  update(dt: number) {
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
  }

  position(coords: Coords) {
    this.coords = coords;
  }
}
