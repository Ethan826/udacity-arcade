/// <reference path="./engine.ts"/>
import {CANVAS_CONSTANTS, Difficulty} from "./engine";
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

/* The enum implementation in TypeScript compiles to this code in JavaScript.
 * The EntityType enum lets an Entity (which is an abstract class implemented
 * by Player and Enemy) to keep track of its type without using reflection.
 * This could be expanded to other entities like tokens, coins, other players,
 * other enemies, etc.
 */
enum EntityType {
  player,
  enemy
}

/* The ArrowKeys enum assists in keyboard inputs for Player. */
enum ArrowKeys {
  left,
  up,
  right,
  down
}

/* The GameConditions enum is used by the main loop. */
export enum GameConditions {
  inProgress,
  won,
  lost
}

/* This avoids magic constants in the code. */
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

  /* App manages the ResourceCache, the entities, the difficulty level, and
   * holds a reference to the context for rendering.
   */
  constructor(
    private rc: ResourceCache,
    private ctx: CanvasRenderingContext2D,
    private difficulty: Difficulty) {

    /* Entities takes the context, the image, an initial position, and the
     * difficulty level.
     */
    let player = new Player(
      this.ctx,
      this.rc.getImage("images/char-boy.png"),
      {
        x: CANVAS_CONSTANTS.canvasWidth / 2,
        y: Math.floor(CANVAS_CONSTANTS.rowHeight * CANVAS_CONSTANTS.numRows)
      },
      this.difficulty
      );
    let topEnemy = new EnemyBug(
      this.ctx,
      this.rc.getImage("images/enemy-bug.png"),
      { x: 0, y: CANVAS_CONSTANTS.rowHeight * 2 },
      this.difficulty
      );
    let middleEnemy = new EnemyBug(
      this.ctx,
      this.rc.getImage("images/enemy-bug.png"),
      { x: 0, y: CANVAS_CONSTANTS.rowHeight * 3 },
      this.difficulty
      );
    let bottomEnemy = new EnemyBug(
      this.ctx,
      this.rc.getImage("images/enemy-bug.png"),
      { x: 0, y: CANVAS_CONSTANTS.rowHeight * 4 },
      this.difficulty
      );

    /* After creating the entities, put them in the array of entities. */
    this.entities = [player, topEnemy, middleEnemy, bottomEnemy];
    /* playerIndex tracks the array index for the Player. */
    this.playerIndex = 0;

    /* The entities' sprites are bigger than the visible portion of the images.
     * Each entity holds its own coordinates for the visible portion of the
     * images. The playerBounds define the portion of the canvas that the
     * player can occupy. The middle of the Player can't actually go to the
     * edge of the canvas, so this logic keeps track of how close to the edge
     * the player can go. The keepPlayerInBounds() method uses this.
     */
    let halfDimensions = this.getHalfDimensions(player);
    this.playerBounds = {
      startX: halfDimensions.x,
      endX: CANVAS_CONSTANTS.canvasWidth - halfDimensions.x,
      startY: halfDimensions.y,
      endY: (CANVAS_CONSTANTS.numRows + 0.5) * CANVAS_CONSTANTS.rowHeight - halfDimensions.y
    }
  }

  /* Getter method. */
  getGameCondition() {
    return this.gameCondition;
  }

  /* Loop through the entities and call each entity's render method. */
  render() {
    this.entities.forEach((entity) => {
      entity.render();
    });
  }

  /* Loop through the entities and call each entity's update method. */
  update(dt: number) {
    this.entities.forEach((entity) => {
      entity.update(dt);

      /* Do some checks: if the loop is on Player, make sure the player is in
       * bounds. Check for collisions. Then see if the game is won or lost.
       */
      if (entity.entityType === EntityType.player) {
        this.keepPlayerInBounds(entity as Player);
      }
      if (this.checkCollisions()) { this.gameCondition = GameConditions.lost; }
      if (this.checkWin()) { this.gameCondition = GameConditions.won; }
    });
  }

  /* If the Player would be outside of the canvas bounds following the update()
   * method, put the player on the edge.
   */
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

  /* Loops through the entities, skipping over the Player. Checks to see if the
   * Player has collided with any of the entities.
   */
  private checkCollisions() {
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

  /* Determine if the player has gone to the top of the screen */
  private checkWin() {
    let player = this.entities[this.playerIndex];
    let playerRectangleCoords = this.getRectangleCoords(player);
    return playerRectangleCoords.startY <= CANVAS_CONSTANTS.rowHeight / 2 ? true : false;
  }

  /* The entity's half dimensions are used for the radius in the collision
   * logic, the keepPlayerInBounds() logic, and the edges of the entity given
   * its point coordinates.
   */
  private getHalfDimensions(entity: Entity): Coords {
    let entityHalfWidth = (entity.dimensions.endX - entity.dimensions.startX) / 2;
    let entityHalfHeight = (entity.dimensions.endY - entity.dimensions.startY) / 2;
    return { x: entityHalfWidth, y: entityHalfHeight }
  }

  /* Given an entity's point coordinates, return its boundaries. */
  private getRectangleCoords(entity: Entity): RectangleCoords {
    let halfDimensions = this.getHalfDimensions(entity);
    return {
      startX: entity.coords.x - halfDimensions.x,
      endX: entity.coords.x + halfDimensions.x,
      startY: entity.coords.y - halfDimensions.y,
      endY: entity.coords.y + halfDimensions.y
    };
  }

  /* Given two entities, return true if they have collided. */
  private collisionHelper(e1: Entity, e2: Entity): boolean {
    // https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
    let dx = e1.coords.x - e2.coords.x;
    let dy = e1.coords.y - e2.coords.y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    return distance < e1.radius + e2.radius ? true : false;
  }

  /* Naive implementation of collisionHelper(). */
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
  difficulty: Difficulty;
  radius: number;
}

/* TypeScript permits abstract classes. The Entity class is implemented by
 * the Enemy and Player classes.
 */
abstract class Entity implements IEntity {
  dimensions: RectangleCoords;
  entityType: EntityType;
  radius: number;
  difficulty: Difficulty;

  constructor(
    protected ctx: CanvasRenderingContext2D,
    protected sprite: HTMLImageElement,
    public coords: Coords) {
  }

  abstract update(dt: number): void;

  /* getRadius() uses 0.8 as a hack to avoid non-round sprites from colliding
   * too easily.
   */
  protected getRadius(): number {
    return 0.8 * Math.max(
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

/* This is how TypeScript handles implementing the abstract class Entity.
 */
class EnemyBug extends Entity {
  private speed: number;
  entityType = EntityType.enemy;
  dimensions = {
    startX: 1,
    startY: 75,
    endX: 99,
    endY: 144
  }

  constructor(
    ctx: CanvasRenderingContext2D,
    sprite: HTMLImageElement,
    coords: Coords,
    difficulty: Difficulty) {
    super(ctx, sprite, coords);
    this.radius = this.getRadius();

    /* The higher the difficulty setting, the faster the enemy. */
    if (difficulty == Difficulty.easy) {
      this.speed = Math.random() * 200 + 100;
    } else if (difficulty == Difficulty.medium) {
      this.speed = Math.random() * 300 + 100;
    } else {
      this.speed = Math.random() * 400 + 100;
    }
  }

  update(dt: number) {
    this.coords.x += dt * this.speed;

    /* The 1.1 multiplier is to let the bug get fully off screen before cycling
     * back to the start.
     */
    if (this.coords.x - this.sprite.width > CANVAS_CONSTANTS.canvasWidth) {
      this.coords.x = this.coords.x - Math.floor(1.1 * CANVAS_CONSTANTS.canvasWidth) - this.sprite.width;
    }
  }
}

/* Keyboard handles key inputs for Player. */
class Keyboard {
  private downKeys = {
    left: false,
    up: false,
    right: false,
    down: false
  }

  // http://nokarma.org/2011/02/27/javascript-game-development-keyboard-input/
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

  constructor(
    ctx: CanvasRenderingContext2D,
    sprite: HTMLImageElement,
    coords: Coords,
    difficulty: Difficulty) {
    super(ctx, sprite, coords);
    this.radius = this.getRadius();

    /* Player gets slower with increasing difficulty. */
    if (difficulty == Difficulty.easy) {
      this.speed = 200;
    } else if (difficulty == Difficulty.medium) {
      this.speed = 150;
    } else {
      this.speed = 100;
    }
  }

  update(dt: number) {
    if (this.keyboard.isDown(ArrowKeys.left)) { this.coords.x -= this.speed * dt; }
    if (this.keyboard.isDown(ArrowKeys.up)) { this.coords.y -= this.speed * dt; }
    if (this.keyboard.isDown(ArrowKeys.right)) { this.coords.x += this.speed * dt; }
    if (this.keyboard.isDown(ArrowKeys.down)) { this.coords.y += this.speed * dt; }
  }

  position(coords: Coords) {
    this.coords = coords;
  }
}
