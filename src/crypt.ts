const {Aes} = require('decentjs-lib/lib');

export class CryptoUtils {
    /**
     * Encrypts message with given private-pubic key pair
     *
     * @param {string} message
     * @param {string} privateKey
     * @param {string} publicKey
     * @param {string} [nonce]
     * @return {Buffer}
     */
    public static encryptWithChecksum(message: string,
                                      privateKey: string,
                                      publicKey: string,
                                      nonce: string = ''): Buffer {
        return Aes.encrypt_with_checksum(privateKey, publicKey, nonce, message);
    }
}
