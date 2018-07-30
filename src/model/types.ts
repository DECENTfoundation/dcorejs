export type ArrayValidationTuple = [{ new(): any }, (string | { new(): any })];

export enum Type {
    string = 'string',
    number = 'number',
    boolean = 'boolean',
    object = 'object',
    function = 'function'
}
