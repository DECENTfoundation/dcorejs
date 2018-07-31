import { ArrayValidationTuple, Type } from '../model/types';

export class BaseObject {
    protected validateArguments(args: IArguments | Array<any>, types: ({ new(): any } | string | ArrayValidationTuple)[]): boolean {
        if (args.length !== types.length) {
            return false;
        }

        for (let i = 0; i < args.length; i += 1) {
            const arg = args[i];
            if (typeof types[i] === 'function') {
                const constructor = types[i] as { new(): any };
                if (!this.validateObject(arg, constructor)) {
                    return false;
                }
            } else if (typeof types[i] === 'object') {
                const validationTuple = types[i] as ArrayValidationTuple;
                if (!this.validateArray(arg, validationTuple[1])) {
                    return false;
                }
            } else {
                if (typeof arg !== types[i]) {
                    return false;
                }
            }
        }
        return true;
    }

    protected getConstructorName(construct: { new(): any }): string {
        const funcNameRegex = /function (.{1,})\(/;
        const results = (funcNameRegex).exec(construct.toString());
        return (results && results.length > 1) ? results[1] : '';
    }

    protected validateObject<T>(object: T | any, typeConstructor: { new(): T }): boolean {
        const t = new typeConstructor();
        let isValid = true;
        if (typeof object !== 'object') {
            return false;
        }
        Object.keys(t).forEach(key => {
            if (t[key] !== null && typeof t[key] !== typeof object[key]) {
                isValid = false;
            }
        });
        return isValid;
    }

    protected validateArray<T>(array: Array<T> | any, ofType: string | { new(): any }): boolean {
        if (!Array.isArray(array)) {
            return false;
        }
        if (array.length > 0) {
            for (let i = 0; i < array.length; i++) {
                const el = array[i];
                if (typeof ofType === Type.string) {
                    console.log(el);
                    if (!this.validateStringType(el, ofType as string)) {
                        return false;
                    }
                } else if (typeof ofType === 'function') {
                    console.log(el);
                    if (!this.validateObject(el, ofType)) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    protected validateStringType(val: any, type: string): boolean {
        return typeof val === type;
    }
}
