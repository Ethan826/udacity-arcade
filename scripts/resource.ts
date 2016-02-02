/**
* The GameImage object maintains its own state over whether it is ready in a
* dedicated boolean variable, rather than the kludge of changing types from
* boolean to HTMLImageElement. This class is not exported, but its instances
* are closed over by the ResourceCache class.
*/
interface GameImage {
  url: string;
  ready: boolean;
  img: HTMLImageElement;
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
  private requestsComplete = false;

  constructor(private callback: Function) { }

  addImage(url: string) {
    if (!this.getImage(url)) {
      let img = new Image();
      img.src = url;
      let tempImage: GameImage = { url: url, ready: false, img: img };
      tempImage.img.onload = () => {
        tempImage.ready = true;
        if (this.checkAllLoaded()) {
          this.callback();
        }
      };
      this.images.push(tempImage);
    }
  }

  getImage(url: string) {
    let result: HTMLImageElement = null;
    this.images.forEach((image) => {
      if (image.url === url) {
        result = image.img;
      }
    });
    return result;
  }

  markRequestsComplete() {
    this.requestsComplete = true;
  }

  private checkAllLoaded() {
    let result = true;
    if (!this.requestsComplete) {
      result = false;
    } else {
      this.images.forEach((image) => {
        if (!image.ready) {
          result = false;
        }
      });
    }
    return result;
  }
}

/**
* The ImageSupervisor class is the imtermediary to the GameImage instances. It
* handles initiating each object and tracking when all are ready by registering
* callbacks with each instance. When all callbacks are called, the class calls
* its own callback function, which permits the program to continue. This class's
* instance is not exported, but is closed over by the ResourceCache class.
*/
export class ResourceCache {
  private allLoaded = false;
  private imageSupervisor = new ImageSupervisor(() => {
    this.allLoaded = true;
    this.callback();
  });

  constructor(urls: string[], private callback: Function) {
    urls.forEach((url) => {
      this.imageSupervisor.addImage(url);
    });
    this.imageSupervisor.markRequestsComplete();
  }

  getImage(url: string): HTMLImageElement {
    return this.imageSupervisor.getImage(url);
  }
}
