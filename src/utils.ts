import { DecentLib } from './helpers';
import { CryptoUtils } from './crypt';
import {ChainApi} from './api/chain';


export class Utils {

    /**
     * Change price amount from blockchain format to real and readable formatted string.
     *
     * Example: Amount price from blockchain is 1, formatted price 0.00000001 DCT
     *
     * @param {number} dctAmount
     * @return {string}
     */
    public static formatToReadiblePrice(dctAmount: number): string {
        return (dctAmount / ChainApi.DCTPower).toFixed(8);
    }

    public static ripemdHash(fromBuffer: Buffer): string {
        return CryptoUtils.ripemdHash(fromBuffer);
    }

    /**
     * Generates private and public key from given brain key.
     *
     * Return array of keys in form [privateKey: KeyPrivate, publicKey: KeyPublic]
     *
     * @param {string} fromBrainKey
     * @return {any[]} [privateKey: KeyPrivate, publicKey: KeyPublic]
     */
    public static generateKeys(fromBrainKey: string): (KeyPrivate | KeyPublic)[] {

        const pkey: KeyPrivate = Utils.generatePrivateKey(fromBrainKey);
        const pubKey: KeyPublic = Utils.getPublicKey(pkey);
        return [pkey, pubKey];
    }

    /**
     * Calculate public key from given private key.
     *
     * @param {KeyPrivate} privkey
     * @return {KeyPublic}
     */
    public static getPublicKey(privkey: KeyPrivate): KeyPublic {
        const publicKey: any = privkey.key.toPublicKey();
        return new KeyPublic(publicKey);
    }

    /**
     * Create KeyPrivate object from WIF format of private key.
     *
     * @param {string} pkWif
     * @return {KeyPrivate}
     */
    public static privateKeyFromWif(pkWif: string): KeyPrivate {
        const pKey = DecentLib.PrivateKey.fromWif(pkWif);
        return new KeyPrivate(pKey);
    }

    /**
     * Create KeyPublic object from string format of public key.
     *
     * @param {string} pubKeyString
     * @return {KeyPublic}
     */
    public static publicKeyFromString(pubKeyString: string): KeyPublic {
        const pubKey = DecentLib.PublicKey.fromPublicKeyString(pubKeyString);
        return new KeyPublic(pubKey);
    }

    private static generatePrivateKey(brainKey: string): KeyPrivate {
        const pKey = DecentLib.key.get_brainPrivateKey(brainKey);
        return new KeyPrivate(pKey);
    }
}

/**
 * PKI private key
 */
export class KeyPrivate {
    private _privateKey: any;

    constructor(privateKey: any) {
        this._privateKey = privateKey;
    }

    /**
     * Raw representation of key for decent-js
     * library purposes.
     * @return {any}
     */
    get key(): any {
        return this._privateKey;
    }

    /**
     * WIF format string representation of key
     * @return {string}
     */
    get stringKey(): string {
        return this._privateKey.toWif();
    }

}

/**
 * PKI public key
 */
export class KeyPublic {
    private _publicKey: any;

    constructor(publicKey: any) {
        this._publicKey = publicKey;
    }

    /**
     * Raw representation of key for decent-js
     * library purposes.
     * @return {any}
     */
    get key(): any {
        return this._publicKey;
    }

    /**
     * String representation of key
     * @return {string}
     */
    get stringKey(): string {
        return this._publicKey.toString();
    }

}
