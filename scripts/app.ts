/// <reference path="./engine.ts"/>

interface Location {
  x: number;
  y: number;
}

/* Avoid globals and problems with loading sequence by having the App class
 * manage the Engine class in a single point of entry.
 */
export class App {
  constructor() { }
}

interface Entity {
  update: (dt: number) => void;
  render: (ctx: CanvasRenderingContext2D) => void;
}

class Enemy implements Entity {
  private location: Location;

  constructor(private ctx: CanvasRenderingContext2D, private sprite: HTMLImageElement) { }

  update(dt: number) { }

  render(ctx: CanvasRenderingContext2D) {
    this.ctx.drawImage(this.sprite, this.location.x, this.location.y);
  }
}

class Player implements Entity {
  update(dt: number) { };
  render() { };
  handleInput() { };
}
