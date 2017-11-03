import { CryptoUtils } from './crypt';

export class Utils {
  public static ripemdHash(fromBuffer: Buffer): string {
    return CryptoUtils.ripemdHash(fromBuffer);
  }

  // public static generateKeys(fromBrainKey: string) {
  //     const pkey = Utils.generatePrivateKey(fromBrainKey);
  //     const pubKey = Utils.generatePublicKey(pkey);
  //     return [pkey, pubKey];
  // }
  //
  // public static getPublicKey(fromPrivateKey: string): string {
  //     const privateKey = PrivateKey.fromWif(fromPrivateKey);
  //     return privateKey.toPublicKey().toString();
  // }
  //
  // private static generatePrivateKey(brainKey: string) {
  //     return key.get_brainPrivateKey(brainKey);
  // }
  //
  // private static generatePublicKey(privkey: any): string {
  //     const publicKey = privkey.toPublicKey();
  //     return publicKey.toString();
  // }
}
