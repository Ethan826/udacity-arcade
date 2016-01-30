/**
* The GameImage class maintains its own state over whether it is ready in a
* dedicated boolean variable, rather than the kludge of changing types from
* boolean to HTMLImageElement. This class is not exported, but its instances
* are closed over by the ResourceCache class.
*/
class GameImage {
    url: string;
    image: HTMLImageElement;
    ready: boolean;
}

/**
* The ImageSupervisor class is the imtermediary to the GameImage instances. It
* handles initiating each object and tracking when all are ready by registering
* callbacks with each instance. When all callbacks are called, the class calls
* its own callback function, which permits the program to continue. This class's
* instance is not exported, but is closed over by the ResourceCache class.
*/
class ImageSupervisor {
    private images: GameImage[] = [];
    private allReady = false;
    private requestsDone = false;

    constructor(private callback: Function) { }

    private checker(): boolean {
        let result = true;
        this.images.forEach((i) => {
            if (i.ready === false) {
                result = false;
            }
        });
        return result;
    }

    requestsAreDone() {
        this.requestsDone = true;
    }

    addImage(url: string) {
        let newImage = new GameImage;
        newImage.url = url;
        newImage.ready = false;
        let img = new Image();
        img.src = url;
        img.onload = () => {
            newImage.ready = true;
            this.allReady = this.checker() && this.requestsDone;
            if(this.allReady) {
                this.callback();
            }
        };
        this.images.push(newImage);
    }

    getImage(url: string): HTMLImageElement {
        let result = this.images.filter((i) => {
            return i.url === url;
        })[0]["image"];
        if(result) {
            return result;
        } else {
            throw "Requested image url not found.";
        }
    }
}

/**
* Replace the load() method with the class constructor, which must be called
* with an array of strings representing the URLs of the images for loading.
* The constructor handles repeatedly calling its helper method rather than the
* load() method calling a helper method (load() was only being called once).
* The class exposes only its constructor and its getImage() method, as well as
* registering the resourceCache.callback() method for when all images are
* loaded.
*/
export class ResourceCache {
    private imageSupervisor: ImageSupervisor;
    private callback: Function;

    constructor(urls: string[], callback: Function) {
        this.callback = callback;
        this.imageSupervisor = new ImageSupervisor(() => {
            this.callback();
        });
        urls.forEach((url) => {
            this.imageSupervisor.addImage(url);
        });
        this.imageSupervisor.requestsAreDone();
    }

    getImage(url: string) {
        this.imageSupervisor.getImage(url);
    }
}
