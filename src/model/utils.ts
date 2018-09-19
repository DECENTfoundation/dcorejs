import {dcorejs_lib} from '../helpers';
import {Utils} from '../utils';
// import {BigInteger} from 'big-integer';
import { PrivateKey, PublicKey } from 'dcorejs-lib';

export interface BrainKeyInfo {
    brain_priv_key: string;
    wif_priv_key: string;
    pub_key: string;
}

export enum UtilsError {
    wrong_private_key = 'wrong_private_key'
}

/**
 * PKI private key
 */
export class KeyPrivate {
    private _privateKey: PrivateKey = {};

    /**
     * Create KeyPrivate from brain key.
     *
     * @param {string} brainKey     Brain key to generate private key from.
     * @param {number} sequence     Sequence number, for generating derived private key
     * @returns {KeyPrivate}        KeyPrivate instance.
     */
    static fromBrainKey(brainKey: string, sequence: number = 0): KeyPrivate {
        const pKey = dcorejs_lib.key.get_brainPrivateKey(brainKey, sequence);
        return new KeyPrivate(pKey);
    }

    /**
     * Create KeyPrivate from WIF/hex format of private key.
     * @param {string} privateKeyWif    Private key in WIF(hex) (Wallet Import Format) format.
     * @returns {KeyPrivate}            KeyPrivate instance.
     */
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

    /**
     * Get public key for private key.
     * @returns {KeyPublic}     KeyPublic instance.
     */
    public getPublicKey(): KeyPublic {
        return new KeyPublic(this._privateKey.toPublicKey());
    }

}

/**
 * PKI public key
 */
export class KeyPublic {
    private _publicKey: PublicKey = new PublicKey();

    static get empty(): string {
        return 'DCT1111111111111111111111111111111114T1Anm';
    }

    /**
     * Create KeyPublic object from public key string.
     * @param {string} publicString     Public key string.
     * @returns {KeyPublic}             KeyPublic instance.
     */
    static fromString(publicString: string): KeyPublic {
        const pubKey = dcorejs_lib.PublicKey.fromPublicKeyString(publicString);
        return new KeyPublic(pubKey);
    }

    /**
     * Create KeyPublic from KeyPrivate object.
     * @param {KeyPrivate} privateKey   KeyPrivate object.
     * @returns {KeyPublic}             KeyPublic instance.
     */
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
     * @return {string}     String public key.
     */
    get stringKey(): string {
        return this._publicKey.toString();
    }
}

export class ElGamalKeys {
    private _publicKey = '';
    private _privateKey = '';

    public get privateKey(): string {
        return this._privateKey;
    }

    public get publicKey(): string {
        return this._publicKey;
    }

    /**
     * Generate ElGamalKeys object from public key WIF.
     * @param {string} privateKey       Private key in WIF(hex) (Wallet Import Format) format
     * @returns {ElGamalKeys}           ElGamalKeys instance.
     */
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
