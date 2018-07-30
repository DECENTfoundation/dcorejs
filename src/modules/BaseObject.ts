export class BaseObject {
    protected validateArguments(args: IArguments, types: ({ new(): any } | string)[]): boolean {
        let isValid = true;
        if (args.length !== types.length) {
            return false;
        }

        for (let i = 0; i < args.length; i += 1) {
            const arg = args[i];
            if (typeof types[i] === 'function') {
                const contructor = types[i] as { new(): any };
                if (this.getContructorName(contructor) === 'Array') {
                    if (!this.validateArray(arg, contructor)) {
                        isValid = false;
                        return false;
                    }
                } else {
                    if (!this.validateObject(arg, contructor)) {
                        isValid = false;
                        return false;
                    }
                }
            } else {
                if (typeof arg !== types[i]) {
                    isValid = false;
                    return false;
                }
            }
        }
        return isValid;
    }

    protected getContructorName(construct: { new(): any }): string {
        const funcNameRegex = /function (.{1,})\(/;
        const results = (funcNameRegex).exec(construct.toString());
        return (results && results.length > 1) ? results[1] : '';
    }

    protected validateObject<T>(object: T | any, typeContructor: { new(): T }): boolean {
        const t = new typeContructor();
        let isValid = true;
        if (typeof object !== 'object') {
            return false;
        }
        Object.keys(t).forEach(key => {
            if (t[key] !== null && typeof t[key] !== typeof object[key]) {
                if (isValid) {
                    isValid = false;
                }
            }
        });
        return isValid;
    }

    protected validateArray<T>(array: Array<T> | any, typeContructor: { new(): T }): boolean {
        if (!Array.isArray(array)) {
            return false;
        }
        if (array.length > 0) {
            for (const obj in array) {
                if (this.validateObject<T>(obj, typeContructor)) {
                    return false;
                }
            }
        }
        return true;
    }
}
