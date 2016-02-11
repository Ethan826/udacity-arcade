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
        });
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
        if(this.keyboard.isDown(ArrowKeys.left)) {
            this.location.x -= this.speed * dt;
        }
        if(this.keyboard.isDown(ArrowKeys.up)) {
            this.location.y -= this.speed * dt;
        }
        if(this.keyboard.isDown(ArrowKeys.right)) {
            this.location.x += this.speed * dt;
        }
        if(this.keyboard.isDown(ArrowKeys.down)) {
            this.location.y += this.speed * dt;
        }
    }

}
