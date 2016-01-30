define(["require", "exports"], function (require, exports) {
    "use strict";
    /**
    * The GameImage class maintains its own state over whether it is ready in a
    * dedicated boolean variable, rather than the kludge of changing types from
    * boolean to HTMLImageElement. This class is not exported, but its instances
    * are closed over by the ResourceCache class.
    */
    var GameImage = (function () {
        function GameImage() {
        }
        return GameImage;
    }());
    /**
    * The ImageSupervisor class is the imtermediary to the GameImage instances. It
    * handles initiating each object and tracking when all are ready by registering
    * callbacks with each instance. When all callbacks are called, the class calls
    * its own callback function, which permits the program to continue. This class's
    * instance is not exported, but is closed over by the ResourceCache class.
    */
    var ImageSupervisor = (function () {
        function ImageSupervisor(callback) {
            this.callback = callback;
            this.images = [];
            this.allReady = false;
            this.requestsDone = false;
        }
        ImageSupervisor.prototype.checker = function () {
            var result = true;
            this.images.forEach(function (i) {
                if (i.ready === false) {
                    result = false;
                }
            });
            return result;
        };
        ImageSupervisor.prototype.requestsAreDone = function () {
            this.requestsDone = true;
        };
        ImageSupervisor.prototype.addImage = function (url) {
            var _this = this;
            var newImage = new GameImage;
            newImage.url = url;
            newImage.ready = false;
            var img = new Image();
            img.src = url;
            img.onload = function () {
                newImage.ready = true;
                _this.allReady = _this.checker() && _this.requestsDone;
                if (_this.allReady) {
                    _this.callback();
                }
            };
            this.images.push(newImage);
        };
        ImageSupervisor.prototype.getImage = function (url) {
            var result = this.images.filter(function (i) {
                return i.url === url;
            })[0]["image"];
            if (result) {
                return result;
            }
            else {
                throw "Requested image url not found.";
            }
        };
        return ImageSupervisor;
    }());
    /**
    * Replace the load() method with the class constructor, which must be called
    * with an array of strings representing the URLs of the images for loading.
    * The constructor handles repeatedly calling its helper method rather than the
    * load() method calling a helper method (load() was only being called once).
    * The class exposes only its constructor and its getImage() method, as well as
    * registering the resourceCache.callback() method for when all images are
    * loaded.
    */
    var ResourceCache = (function () {
        function ResourceCache(urls, callback) {
            var _this = this;
            this.callback = callback;
            this.imageSupervisor = new ImageSupervisor(function () {
                _this.callback();
            });
            urls.forEach(function (url) {
                _this.imageSupervisor.addImage(url);
            });
            this.imageSupervisor.requestsAreDone();
        }
        ResourceCache.prototype.getImage = function (url) {
            this.imageSupervisor.getImage(url);
        };
        return ResourceCache;
    }());
    exports.ResourceCache = ResourceCache;
});
