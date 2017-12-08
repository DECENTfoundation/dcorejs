import { DecentLib } from './helpers';
var RIPEMD160 = require('ripemd160');
var CryptoUtils = (function () {
    function CryptoUtils() {
    }
    CryptoUtils.encryptWithChecksum = function (message, privateKey, publicKey, nonce) {
        if (nonce === void 0) { nonce = ''; }
        return DecentLib.Aes.encrypt_with_checksum(privateKey.key, publicKey.key, nonce, message);
    };
    CryptoUtils.decryptWithChecksum = function (message, privateKey, publicKey, nonce) {
        if (nonce === void 0) { nonce = ''; }
        return DecentLib.Aes.decrypt_with_checksum(privateKey.key, publicKey.key, nonce, message);
    };
    CryptoUtils.ripemdHash = function (fromBuffer) {
        return new RIPEMD160().update(fromBuffer).digest('hex');
    };
    return CryptoUtils;
}());
export { CryptoUtils };
//# sourceMappingURL=crypt.js.map