const { Aes } = require('decentjs-lib/lib');
const RIPEMD160 = require('ripemd160');

export class CryptoUtils {
  /**
     * Encrypts message with given private-pubic key pair
     *
     * @param {string} message
     * @param {any} privateKey
     * @param {any} publicKey
     * @param {string} [nonce]
     * @return {Buffer}
     */
  public static encryptWithChecksum(
    message: string,
    privateKey: any,
    publicKey: any,
    nonce: string = ''
  ): Buffer {
      console.log();
    return Aes.encrypt_with_checksum(privateKey, publicKey, nonce, message);
  }

  public static ripemdHash(fromBuffer: Buffer): string {
    return new RIPEMD160().update(fromBuffer).digest('hex');
  }
}
