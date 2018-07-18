/**
 * @module Helpers
 */
import * as dcore from 'dcorejs-lib';

export let dcorejs_lib: any = dcore;

export function setLibRef(libRef: any) {
    dcorejs_lib = libRef;
}

export function getLibRef(): any {
    return dcorejs_lib;
}
