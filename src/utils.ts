import {CryptoUtils} from './crypt';

const {
    PrivateKey,
    key
} = require('decentjs-lib/lib');

export class Utils {
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
    public static generateKeys(fromBrainKey: string): any[] {
        const pkey: KeyPrivate = Utils.generatePrivateKey(fromBrainKey);
        const pubKey: KeyPublic = Utils.getPublicKey(pkey);
        return [pkey, pubKey];
    }

    public static getPublicKey(privkey: KeyPrivate): KeyPublic {
        const publicKey: any = privkey.key.toPublicKey();
        return new KeyPublic(publicKey);
    }

    public static privateKeyFromWif(pkWif: string): KeyPrivate {
        const pKey = PrivateKey.fromWif(pkWif);
        return new KeyPrivate(pKey);
    }

    private static generatePrivateKey(brainKey: string): KeyPrivate {
        const pKey = key.get_brainPrivateKey(brainKey);
        return new KeyPrivate(pKey);
    }
}

export class KeyPrivate {
    private _privateKey: any;

    get key(): any {
        return this._privateKey;
    }

    get stringKey(): string {
        return this._privateKey.toWif();
    }

    constructor(privateKey: any) {
        this._privateKey = privateKey;
    }
}

export class KeyPublic {
    private _publicKey: any;

    get key(): any {
        return this._publicKey;
    }

    get stringKey(): string {
        return this._publicKey.toString();
    }

    constructor(publicKey: any) {
        this._publicKey = publicKey;
    }
}
