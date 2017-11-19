/// <reference types="node" />
export declare class Utils {
    static ripemdHash(fromBuffer: Buffer): string;
    static generateKeys(fromBrainKey: string): any[];
    static getPublicKey(privkey: KeyPrivate): KeyPublic;
    static privateKeyFromWif(pkWif: string): KeyPrivate;
    static publicKeyFromString(pubKeyString: string): KeyPublic;
    private static generatePrivateKey(brainKey);
}
export declare class KeyPrivate {
    private _privateKey;
    constructor(privateKey: any);
    readonly key: any;
    readonly stringKey: string;
}
export declare class KeyPublic {
    private _publicKey;
    constructor(publicKey: any);
    readonly key: any;
    readonly stringKey: string;
}
