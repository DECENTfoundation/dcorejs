/// <reference types="node" />
export declare class CryptoUtils {
    /**
       * Encrypts message with given private-pubic key pair
       *
       * @param {string} message
       * @param {string} privateKey
       * @param {string} publicKey
       * @param {string} [nonce]
       * @return {Buffer}
       */
    static encryptWithChecksum(message: string, privateKey: string, publicKey: string, nonce?: string): Buffer;
    static ripemdHash(fromBuffer: Buffer): string;
}
