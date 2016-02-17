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

let KEY_CONSTANTS = {
  37: ArrowKeys.left,
  38: ArrowKeys.up,
  39: ArrowKeys.right,
  40: ArrowKeys.down
}

/* Avoid globals and problems with loading sequence by having the App class
 * manage the Engine class in a single point of entry.
 */
export class App {
  private entities: Entity[];

  constructor(private rc: ResourceCache, private ctx: CanvasRenderingContext2D) {
    let player = new Player(this.ctx, this.rc.getImage("images/char-boy.png"));
    let topEnemy = new EnemyBug(this.ctx, this.rc.getImage("images/enemy-bug.png"), 2);
    let middleEnemy = new EnemyBug(this.ctx, this.rc.getImage("images/enemy-bug.png"), 3);
    let bottomEnemy = new EnemyBug(this.ctx, this.rc.getImage("images/enemy-bug.png"), 4);
    this.entities = [player, topEnemy, middleEnemy, bottomEnemy];
  }

  render() {
    this.entities.forEach((entity) => {
      entity.render();
    });
  }

  update(dt: number) {
    this.entities.forEach((entity) => {
      entity.update(dt);
      this.checkCollisions();
    });
  }

  private checkCollisions() {
    let coll = false;
    let player = this.entities.filter((entity: Entity) => {
      return entity.entityType == EntityType.player;
    })[0];
    this.entities.forEach((entity) => {
      if(entity.entityType !== EntityType.player) {
        if(this.collisionHelper(player, entity)) {
          console.log("Collisions!");
          coll = true;
        }
      }
    });
    return coll;
  }

  private checkWin() {
    if(this.collisionHelper(this.entities.player , { // TODO: Need to make player a member of entities by changing type
      startX: 0, // TODO: Make collisionHelper take dimensions
      endX: CANVAS_CONSTANTS.canvasWidth,
      startY: 0,
      endY: 0})) {

      }
  }

  private collisionHelper(e1: Entity, e2: Entity): boolean {
    let e1HalfWidth = (e1.dimensions.endX - e1.dimensions.startX) / 2;
    let e1HalfHeight = (e1.dimensions.endY - e1.dimensions.startY) / 2;
    let e2HalfWidth = (e2.dimensions.endX - e2.dimensions.startX) / 2;
    let e2HalfHeight = (e2.dimensions.endY - e2.dimensions.startY) / 2;
    let e1Coords: EntityCoords = {
      startX: e1.location.x - e1HalfWidth,
      endX: e1.location.x + e1HalfWidth,
      startY: e1.location.y - e1HalfHeight,
      endY: e1.location.y + e1HalfHeight
    };
    let e2Coords: EntityCoords = {
      startX: e2.location.x - e2HalfWidth,
      endX: e2.location.x + e2HalfWidth,
      startY: e2.location.y - e2HalfHeight,
      endY: e2.location.y + e2HalfHeight
    }
    let isEntirelyRight = e1Coords.startX > e2Coords.endX;
    let isEntirelyLeft = e1Coords.endX < e2Coords.startX;
    let isEntirelyAbove = e1Coords.endY < e2Coords.startY;
    let isEntirelyBelow = e1Coords.startY > e2Coords.endY;
    if(isEntirelyLeft || isEntirelyRight || isEntirelyAbove || isEntirelyBelow) {
      return false;
    } else {
      return true;
    }
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
    window.addEventListener("keydown", (e: KeyboardEvent) => {       // This ain't working
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
