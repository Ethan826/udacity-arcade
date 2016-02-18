/// <reference path="./engine.ts"/>
import {CANVAS_CONSTANTS} from "./engine";
import {ResourceCache} from "./resource";

interface Location {
  x: number;
  y: number;
}

interface EntityCoords {
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

  constructor(private rc: ResourceCache, private ctx: CanvasRenderingContext2D) {
    let player = new Player(this.ctx, this.rc.getImage("images/char-boy.png"));
    let topEnemy = new EnemyBug(this.ctx, this.rc.getImage("images/enemy-bug.png"), 2);
    let middleEnemy = new EnemyBug(this.ctx, this.rc.getImage("images/enemy-bug.png"), 3);
    let bottomEnemy = new EnemyBug(this.ctx, this.rc.getImage("images/enemy-bug.png"), 4);
    this.entities = [player, topEnemy, middleEnemy, bottomEnemy];
    this.playerIndex = 0;
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
      if(this.checkCollisions()) { this.gameCondition = GameConditions.lost; }
      if(this.checkWin()) { this.gameCondition = GameConditions.won; };
    });
  }

  private checkCollisions() { // TODO: This needs to account for the sprite's non-rectangular shape
    let coll = false;
    let player = this.entities[this.playerIndex];
    this.entities.forEach((entity) => { // Could also work based on indices
      if(entity.entityType !== EntityType.player) {
        if(this.collisionHelper(player, entity)) {
          coll = true;
        }
      }
    });
    return coll;
  }

  private checkWin() {
    let player = this.entities[this.playerIndex];
    let playerCoords = this.getCoords(player);
    return playerCoords.startY <= CANVAS_CONSTANTS.rowHeight / 2 ? true : false;
  }

  private getCoords(entity: Entity): EntityCoords {
    let entityHalfWidth = (entity.dimensions.endX - entity.dimensions.startX) / 2;
    let entityHalfHeight = (entity.dimensions.endY - entity.dimensions.startY) / 2;
    return {
      startX: entity.location.x - entityHalfWidth,
      endX: entity.location.x + entityHalfWidth,
      startY: entity.location.y - entityHalfHeight,
      endY: entity.location.y + entityHalfHeight
    };
  }

  private collisionHelper(e1: Entity, e2: Entity): boolean {
    let e1Coords = this.getCoords(e1);
    let e2Coords = this.getCoords(e2);
    let isEntirelyRight = e1Coords.startX > e2Coords.endX;
    let isEntirelyLeft = e1Coords.endX < e2Coords.startX;
    let isEntirelyAbove = e1Coords.endY < e2Coords.startY;
    let isEntirelyBelow = e1Coords.startY > e2Coords.endY;
    return isEntirelyLeft || isEntirelyRight || isEntirelyAbove || isEntirelyBelow ? false : true;
  }
}

interface IEntity {
  update: (dt: number) => void;
  render: () => void;
  entityType: EntityType;
  dimensions: EntityCoords;
}

abstract class Entity implements IEntity {
  location: Location;
  dimensions: EntityCoords;
  entityType: EntityType;

  constructor(
    protected ctx: CanvasRenderingContext2D,
    protected sprite: HTMLImageElement) { }

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
  private speed = Math.random() * 400 + 100;
  entityType = EntityType.enemy;

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
      y: CANVAS_CONSTANTS.rowHeight * rowNum
    }
  }

  update(dt: number) {
    this.location.x += dt * this.speed;
    if (this.location.x - this.sprite.width > CANVAS_CONSTANTS.canvasWidth) {
      this.location.x = this.location.x - Math.floor(1.1 * CANVAS_CONSTANTS.canvasWidth) - this.sprite.width;
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

  constructor(ctx: CanvasRenderingContext2D, sprite: HTMLImageElement) {
    super(ctx, sprite);

    this.dimensions = {
      startX: 16,
      startY: 62,
      endX: 84,
      endY: 140
    }

    /* The initial position is in the middle, halfway up the bottom row. */
    this.location = {
      x: CANVAS_CONSTANTS.canvasWidth / 2,
      y: Math.floor(CANVAS_CONSTANTS.rowHeight * CANVAS_CONSTANTS.numRows)
    };
  }

  update(dt: number) {
    if (this.keyboard.isDown(ArrowKeys.left)) {
      this.location.x -= this.speed * dt;
    }
    if (this.keyboard.isDown(ArrowKeys.up)) {
      this.location.y -= this.speed * dt;
    }
    if (this.keyboard.isDown(ArrowKeys.right)) {
      this.location.x += this.speed * dt;
    }
    if (this.keyboard.isDown(ArrowKeys.down)) {
      this.location.y += this.speed * dt;
    }
  }
}
