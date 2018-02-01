import { KeyPrivate, KeyPublic } from './utils';
import { dcorejs_lib } from './helpers';
import * as md5 from 'crypto-js/md5';
import * as aes from 'crypto-js/aes';
import * as cryptoJs from 'crypto-js';

const RIPEMD160 = require('ripemd160');

export class CryptoJSAesJson {

    constructor() {
    }

    stringify(cipherParams) {
        const j = {ct: cipherParams.ciphertext.toString(cryptoJs.enc.Base64)};
        if (cipherParams.iv) {
            j['iv'] = cipherParams.iv.toString();
        }
        if (cipherParams.salt) {
            j['s'] = cipherParams.salt.toString();
        }
        return JSON.stringify(j);
    }

    parse(jsonStr) {
        const j = JSON.parse(jsonStr);
        const cipherParams = cryptoJs.lib.CipherParams.create({ciphertext: cryptoJs.enc.Base64.parse(j.ct)});
        if (j.iv) {
            cipherParams.iv = cryptoJs.enc.Hex.parse(j.iv);
        }
        if (j.s) {
            cipherParams.salt = cryptoJs.enc.Hex.parse(j.s);
        }
        return cipherParams;
    }
}

export class CryptoUtils {
    /**
     * Encrypts message with given private-pubic key pair
     *
     * @param {string} message
     * @param {KeyPrivate} privateKey
     * @param {KeyPublic} publicKey
     * @param {string} [nonce]
     * @return {Buffer}
     */
    public static encryptWithChecksum(message: string,
                                      privateKey: KeyPrivate,
                                      publicKey: KeyPublic,
                                      nonce: string = ''): Buffer {
        return dcorejs_lib.Aes.encrypt_with_checksum(privateKey.key, publicKey.key, nonce, message);
    }

    public static decryptWithChecksum(message: string,
                                      privateKey: KeyPrivate,
                                      publicKey: KeyPublic,
                                      nonce: string = ''): Buffer {
        return dcorejs_lib.Aes.decrypt_with_checksum(privateKey.key, publicKey.key, nonce, message);
    }

    public static ripemdHash(fromBuffer: Buffer): string {
        return new RIPEMD160().update(fromBuffer).digest('hex');
    }

    public static md5(message: string): string {
        return md5(message).toString();
    }

    public static encrypt(message: string, password: string): string {
        return aes.encrypt(message, password, {format: CryptoJSAesJson.prototype}).toString();
    }

    public static decrypt(message: string, password: string): string | null {
        return aes.decrypt(message, password, {format: CryptoJSAesJson.prototype}).toString(cryptoJs.enc.Utf8) || null;
    }

    // decrypt(message: string, withPassword: string) {
    //     return Observable.create(observer => {
    //         this.messageSender = cryptoJS.AES
    //             .decrypt(message, withPassword, {format: CryptoJSAesJson.prototype})
    //             .toString(cryptoJS.enc.Utf8);
    //         if (!this.messageSender) {
    //             observer.error(this.messageSender);
    //         }
    //         observer.next(this.messageSender);
    //     });
    // }
    //
    // encrypt(message, password) {
    //     return cryptoJS.AES
    //         .encrypt(message, password, {format: CryptoJSAesJson.prototype})
    //         .toString();
    // }
}
