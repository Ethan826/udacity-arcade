define(["require", "exports"], function (require, exports) {
    "use strict";
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
            this.requestsComplete = false;
        }
        ImageSupervisor.prototype.addImage = function (url) {
            var _this = this;
            var img = new Image();
            img.src = url;
            var tempImage = { url: url, ready: false, img: img };
            tempImage.img.onload = function () {
                tempImage.ready = true;
                if (_this.checkAllLoaded()) {
                    _this.callback();
                }
            };
            this.images.push(tempImage);
        };
        ImageSupervisor.prototype.getImage = function (url) {
            var result = null;
            this.images.forEach(function (image) {
                if (image.url === url) {
                    result = image.img;
                }
            });
            if (result) {
                return result;
            }
            else {
                throw url + " not found.";
            }
        };
        ImageSupervisor.prototype.markRequestsComplete = function () {
            this.requestsComplete = true;
        };
        ImageSupervisor.prototype.checkAllLoaded = function () {
            var result = true;
            if (!this.requestsComplete) {
                result = false;
            }
            else {
                this.images.forEach(function (image) {
                    if (!image.ready) {
                        result = false;
                    }
                });
            }
            return result;
        };
        return ImageSupervisor;
    }());
    /**
    * The ImageSupervisor class is the imtermediary to the GameImage instances. It
    * handles initiating each object and tracking when all are ready by registering
    * callbacks with each instance. When all callbacks are called, the class calls
    * its own callback function, which permits the program to continue. This class's
    * instance is not exported, but is closed over by the ResourceCache class.
    */
    var ResourceCache = (function () {
        function ResourceCache(urls, callback) {
            var _this = this;
            this.callback = callback;
            this.allLoaded = false;
            this.imageSupervisor = new ImageSupervisor(function () {
                _this.allLoaded = true;
                _this.callback();
            });
            urls.forEach(function (url) {
                _this.imageSupervisor.addImage(url);
            });
            this.imageSupervisor.markRequestsComplete();
        }
        ResourceCache.prototype.getImage = function (url) {
            return this.imageSupervisor.getImage(url);
        };
        return ResourceCache;
    }());
    exports.ResourceCache = ResourceCache;
});
