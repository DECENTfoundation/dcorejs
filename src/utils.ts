import {dcorejs_lib} from './helpers';
import {CryptoUtils} from './crypt';
import {ChainApi} from './api/chain';
import dictionary from './resources/dictionary';
import * as BigInteger from 'big-integer';
import { sha512 } from 'js-sha512';

export interface BrainKeyInfo {
    brain_priv_key: string;
    wif_priv_key: string;
    pub_key: string;
}

/**
 * PKI private key
 */
export class KeyPrivate {
    private _privateKey: any;

    static fromBrainKey(brainKey: string): KeyPrivate {
        const pKey = dcorejs_lib.key.get_brainPrivateKey(brainKey);
        return new KeyPrivate(pKey);
    }

    static fromWif(privateKeyWif: string): KeyPrivate {
        const pKey = dcorejs_lib.PrivateKey.fromWif(privateKeyWif);
        return new KeyPrivate(pKey);
    }

    constructor(privateKey: any) {
        this._privateKey = privateKey;
    }

    /**
     * Raw representation of key for dcorejs_libjs
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

    static fromString(publicString: string): KeyPublic {
        const pubKey = dcorejs_lib.PublicKey.fromPublicKeyString(publicString);
        return new KeyPublic(pubKey);
    }

    static fromPrivateKey(privateKey: KeyPrivate): KeyPublic {
        const publicKey: any = privateKey.key.toPublicKey();
        return new KeyPublic(publicKey);
    }

    constructor(publicKey: any) {
        this._publicKey = publicKey;
    }

    /**
     * Raw representation of key for dcorejs_libjs
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

export class ElGamalKeys {
    private _publicKey: string;
    private _privateKey: string;

    public get privateKey(): string {
        return this._privateKey;
    }

    public get publicKey(): string {
        return this._publicKey;
    }

    static generate(privateKey: string): ElGamalKeys {
        const elGPrivate = Utils.elGamalPrivate(privateKey);
        const elGPub = Utils.elGamalPublic(elGPrivate);
        return new ElGamalKeys(elGPrivate, elGPub);
    }

    constructor(elGPrivateKey: string, elGPublicKey: string) {
        this._privateKey = elGPrivateKey;
        this._publicKey = elGPublicKey;
    }
}


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
    public static generateKeys(fromBrainKey: string): [KeyPrivate, KeyPublic] {
        const normalizedBk = Utils.normalize(fromBrainKey);
        const pkey: KeyPrivate = KeyPrivate.fromBrainKey(normalizedBk);
        const pubKey: KeyPublic = KeyPublic.fromPrivateKey(pkey);
        return [pkey, pubKey];
    }

    /**
     * Calculate public key from given private key.
     *
     * @param {KeyPrivate} privkey
     * @return {KeyPublic}
     */
    public static getPublicKey(privkey: KeyPrivate): KeyPublic {
        return KeyPublic.fromPrivateKey(privkey);
    }

    /**
     * Create KeyPrivate object from WIF format of private key.
     *
     * @param {string} pkWif
     * @return {KeyPrivate}
     */
    public static privateKeyFromWif(pkWif: string): KeyPrivate {
        return KeyPrivate.fromWif(pkWif);
    }

    /**
     * Create KeyPublic object from string format of public key.
     *
     * @param {string} pubKeyString
     * @return {KeyPublic}
     */
    public static publicKeyFromString(pubKeyString: string): KeyPublic {
        return KeyPublic.fromString(pubKeyString);
    }

    public static suggestBrainKey(): string {
        return dcorejs_lib.key.suggest_brain_key(dictionary.en);
    }

    public static getBrainKeyInfo(brainKey: string): BrainKeyInfo {
        const normalizedBK = Utils.normalize(brainKey);
        const keys = Utils.generateKeys(normalizedBK);
        const result: BrainKeyInfo = {
            brain_priv_key: normalizedBK,
            pub_key: keys[1].stringKey,
            wif_priv_key: keys[0].stringKey
        };
        return result;
    }

    public static normalize(brainKey: string) {
        if (typeof brainKey !== 'string') {
            throw new Error('string required for brainKey');
        }
        brainKey = brainKey.trim();
        brainKey = brainKey.toUpperCase();
        return brainKey.split(/[\t\n\v\f\r ]+/).join(' ');
    }

    public static elGamalPublic(elGamalPrivate: string): string {
        const elgPriv = BigInteger(elGamalPrivate);
        const modulus = BigInteger('11760620558671662461946567396662025495126946227619472274' +
            '601251081547302009186313201119191293557856181195016058359990840577430081932807832465057884143546419');
        const generator = BigInteger(3);
        return generator.modPow(elgPriv, modulus).toString();
    }

    public static elGamalPrivate(privateKeyWif: string): string {
        const pKey = Utils.privateKeyFromWif(privateKeyWif);
        const hash = sha512(pKey.key.d.toBuffer());
        return BigInteger(hash, 16).toString();
    }

    public static generateElGamalKeys(privateKeyWif: string): ElGamalKeys {
        return ElGamalKeys.generate(privateKeyWif);
    }
}
