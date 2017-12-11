export let DecentLib: any = {};

export function setLibRef(libRef: any) {
    DecentLib = libRef;
}

export function getLibRef(): any {
    return DecentLib;
}
