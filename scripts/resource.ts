export class ResourceCache {
    load = (urlOrArray: string | string[]) => {
        if (typeof urlOrArray === "string") {
        } else if (typeof urlOrArray === "object") {
            console.log(this.isArrayOfStrings(urlOrArray));
            if (this.isArrayOfStrings(urlOrArray)) {
                // Do stuff
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
