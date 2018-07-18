/**
 * @module CryptoUtils
 */
import {KeyPrivate, KeyPublic} from './utils';
import { dcorejs_lib } from './helpers';
import * as cryptoJs from 'crypto-js';

const RIPEMD160 = require('ripemd160');

/**
 * Custom class for CryptoJS encryption serialization.
 */
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
        const cipherParams = {ciphertext: cryptoJs.enc.Base64.parse(j.ct), iv: '', salt: ''};
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
     * @param {string} message          Message to encrypt.
     * @param {KeyPrivate} privateKey   Private of one side of communication, to encrypt message with.
     * @param {KeyPublic} publicKey     Public key of other side of communication, used in encryption.
     * @param {string} [nonce]          Random number user in encryption process. Default ''.
     * @return {Buffer}                 Buffer with encrypted message.
     */
    public static encryptWithChecksum(message: string,
                                      privateKey: KeyPrivate,
                                      publicKey: KeyPublic,
                                      nonce: string = ''): Buffer {
        return dcorejs_lib.Aes.encrypt_with_checksum(privateKey.key, publicKey.key, nonce, message);
    }

    /**
     * Decrypts message encrypted by CryptoUtils.encryptWithChecksum or memo from DCore network objects.
     *
     * @param {string} message          Encrypted message.
     * @param {KeyPrivate} privateKey   Private key of one of communicating sides. Used to decrypt message.
     * @param {KeyPublic} publicKey     Public key of other communicating side. Used to decrypt message.
     * @param {string} nonce            Random number used in decryption. Default ''.
     * @returns {Buffer}                Buffer with decrypted text.
     */
    public static decryptWithChecksum(message: string,
                                      privateKey: KeyPrivate,
                                      publicKey: KeyPublic,
                                      nonce: string = ''): Buffer {
        return dcorejs_lib.Aes.decrypt_with_checksum(privateKey.key, publicKey.key, nonce, message);
    }

    /**
     * Calculate RIPEMD160 hash from input.
     * Used as 'hash' parameter when submitting content.
     *
     * @param {Buffer} fromBuffer   Input to calculate buffer from.
     * @returns {string}            RIPEMD160 hashed text.
     */
    public static ripemdHash(fromBuffer: Buffer): string {
        return new RIPEMD160().update(fromBuffer).digest('hex');
    }

    /**
     * Calculates MD5 hash out of input.
     *
     * @param {string} message  Input message.
     * @returns {string}        Hashed input.
     */
    public static md5(message: string): string {
        return cryptoJs.MD5(message).toString();
    }

    /**
     * Calculates SHA512 hash of input.
     *
     * @param message       Input message.
     * @returns {string}    Hashed input.
     */
    public static sha512(message: string): string {
        return cryptoJs.SHA512(message).toString(cryptoJs.enc.Hex);
    }

    /**
     * Calculates SHA256 hash of input.
     *
     * @param message       Input message.
     * @returns {string}    Hashed input.
     */
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
     * @param {string} message      Message to be encrypted.
     * @param {string} password     Password for encryption.
     * @returns {string}            Encrypted serialized message.
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
     * @param {string} message      Serialized encrypted message to be decrypted.
     * @param {string} password     Password for decryption.
     * @returns {string | null}     Decrypted message.
     */
    public static decrypt(message: string, password: string): string | null {
        return cryptoJs.AES.decrypt(message, password, {format: CryptoJSAesJson.prototype}).toString(cryptoJs.enc.Utf8) || null;
    }

    /**
     * Encrypt message with AES256-CBC. Result is encrypted hex string.
      * This encryption is compatible with wallet-cli wallet file export key encryption format.
     *
     * @param {string | Buffer} message     Message to be encrypted.
     * @param {string} password             Password for encryption.
     * @returns {string}                    Encrypted message.
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
     *
     * @param {string} message          Message to be decrypted.
     * @param {string} password         Password for decryption.
     * @returns {string}                Decrypted message.
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
