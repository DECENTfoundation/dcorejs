import { KeyPrivate, KeyPublic } from './utils';
import { DecentLib } from './helpers';
import md5 from 'crypto-js/md5';

const RIPEMD160 = require('ripemd160');

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
        return DecentLib.Aes.encrypt_with_checksum(privateKey.key, publicKey.key, nonce, message);
    }

    public static decryptWithChecksum(message: string, privateKey: KeyPrivate, publicKey: KeyPublic, nonce: string = ''): Buffer {
        return DecentLib.Aes.decrypt_with_checksum(privateKey.key, publicKey.key, nonce, message);
    }

    public static ripemdHash(fromBuffer: Buffer): string {
        return new RIPEMD160().update(fromBuffer).digest('hex');
    }

    public static md5(message: string): string {
        return md5(message).toString();
    }
}
