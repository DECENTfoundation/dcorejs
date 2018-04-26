import { KeyPrivate, KeyPublic } from './utils';
import { dcorejs_lib } from './helpers';
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
        return cryptoJs.MD5(message).toString();
    }

    public static sha512(message: string): string {
        return cryptoJs.SHA512(message).toString(cryptoJs.enc.Hex);
    }

    public static sha256(message: string): string {
        return cryptoJs.SHA256(message).toString(cryptoJs.enc.Hex);
    }

    /**
     * Encrypt message using AES256-CBC.
     * Encrypted text is in string representation of following type
     * {
     *  ct: string,
     *  iv: string,
     *  s: string
     * }
     * @param {string} message
     * @param {string} password
     * @returns {string}
     */
    public static encrypt(message: string, password: string): string {
        return cryptoJs.AES.encrypt(message, password, {format: CryptoJSAesJson.prototype}).toString();
    }

    /**
     * Decrypt AES256-CBC encrypted message in form of string representation of following type
     * {
     *  ct: string,
     *  iv: string,
     *  s: string
     * }
     * @param {string} message
     * @param {string} password
     * @returns {string | null}
     */
    public static decrypt(message: string, password: string): string | null {
        return cryptoJs.AES.decrypt(message, password, {format: CryptoJSAesJson.prototype}).toString(cryptoJs.enc.Utf8) || null;
    }

    /**
     * Encrypt message with AES256-CBC. Result is encrypted hex string.
      * This encryption is compatible with wallet-cli wallet file export key encryption format.
     * @param {string | Buffer} message
     * @param {string} password
     * @returns {string}
     */
    public static encryptToHexString(message: string | Buffer, password: string): string {
        const hash = CryptoUtils.sha512(password);
        const ivHex = hash.substr(64, 32);
        const keyHex = hash.substr(0, 64);
        const iv = cryptoJs.enc.Hex.parse(ivHex);
        const key = cryptoJs.enc.Hex.parse(keyHex);

        const msg: Buffer = typeof message === 'string' ? new Buffer(message, 'binary') : message;
        const plainArr = cryptoJs.enc.Hex.parse(msg.toString('hex'));
        const res = cryptoJs.AES.encrypt(plainArr, key, { iv: iv });
        return cryptoJs.enc.Hex.stringify(res.ciphertext);
    }

    /**
     * Decrypts AES256-CBC encrypted hex string message. Result is decrypted string.
     * This decryption is compatible with wallet-cli wallet file export key encryption format.
     * @param {string} message
     * @param {string} password
     * @returns {string}
     */
    public static decryptHexString(message: string, password: string): string {
        const hash = CryptoUtils.sha512(password);
        const ivHex = hash.substr(64, 32);
        const keyHex = hash.substr(0, 64);
        const iv = cryptoJs.enc.Hex.parse(ivHex);
        const key = cryptoJs.enc.Hex.parse(keyHex);

        const cipher_array = cryptoJs.enc.Hex.parse(message);
        const plainwords = cryptoJs.AES.decrypt({ ciphertext: cipher_array, salt: null,  iv: iv }, key, { iv: iv });
        const plainHex = cryptoJs.enc.Hex.stringify(plainwords);
        const buff = new Buffer(plainHex, 'hex');
        return buff.toString();
    }
}
