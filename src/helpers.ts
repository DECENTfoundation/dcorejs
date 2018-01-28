export let dcorejs_lib: any = {};

export function setLibRef(libRef: any) {
    dcorejs_lib = libRef;
}

export function getLibRef(): any {
    return dcorejs_lib;
}
