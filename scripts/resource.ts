export class ResourceCache {
  private resourceCache: { [url: string]: HTMLImageElement } = {};

  private loadHelper(url: string) {
    this.resourceCache[url] = new Image();
  }

  getResourceCache = () => {
    return this.resourceCache;
  }

  load = (urlOrArray: string | string[]) => {
    if (typeof urlOrArray === "string") {
      this.loadHelper(urlOrArray);
    } else if (typeof urlOrArray === "object") {
      console.log(this.isArrayOfStrings(urlOrArray));
      if (this.isArrayOfStrings(urlOrArray)) {
        urlOrArray.forEach((st) => {
          this.loadHelper(st);
        });
      } else {
        throw "load() accepts a string or array of strings";
      }
    } else {
      throw "load() accepts a string or array of strings";
    }
  }

  private isArrayOfStrings(value: any) {
    let result = true;
    value.forEach((val: any) => {
      if (typeof val !== "string") {
        result = false; // Could optimize by returning here but it doesn't work (???)
      }
    });
    return result;
  }
}
