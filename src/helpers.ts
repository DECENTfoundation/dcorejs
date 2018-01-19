export let dcore: any = {};

export function setLibRef(libRef: any) {
    dcore = libRef;
}

export function getLibRef(): any {
    return dcore;
}
