define(["require", "exports", "./engine"], function (require, exports, engine_1) {
    "use strict";
    /* Avoid globals and problems with loading sequence by having the App class
     * manage the Engine class in a single point of entry.
     */
    var App = (function () {
        function App() {
            this.engine = new engine_1.Engine();
        }
        return App;
    }());
    var app = new App;
});
