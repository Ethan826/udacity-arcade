import {Engine} from "./engine";

/* Avoid globals and problems with loading sequence by having the App class
 * manage the Engine class in a single point of entry.
 */
class App {
  private engine = new Engine();

  constructor() { }
}

let app = new App;
