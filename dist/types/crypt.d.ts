/// <reference types="node" />
import { KeyPrivate, KeyPublic } from './utils';
export declare class CryptoUtils {
    static encryptWithChecksum(message: string, privateKey: KeyPrivate, publicKey: KeyPublic, nonce?: string): Buffer;
    static decryptWithChecksum(message: string, privateKey: KeyPrivate, publicKey: KeyPublic, nonce?: string): Buffer;
    static ripemdHash(fromBuffer: Buffer): string;
}
