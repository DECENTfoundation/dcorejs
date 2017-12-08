import { DecentLib } from './helpers';
import { CryptoUtils } from './crypt';
var Utils = (function () {
    function Utils() {
    }
    Utils.ripemdHash = function (fromBuffer) {
        return CryptoUtils.ripemdHash(fromBuffer);
    };
    Utils.generateKeys = function (fromBrainKey) {
        var pkey = Utils.generatePrivateKey(fromBrainKey);
        var pubKey = Utils.getPublicKey(pkey);
        return [pkey, pubKey];
    };
    Utils.getPublicKey = function (privkey) {
        var publicKey = privkey.key.toPublicKey();
        return new KeyPublic(publicKey);
    };
    Utils.privateKeyFromWif = function (pkWif) {
        var pKey = DecentLib.PrivateKey.fromWif(pkWif);
        return new KeyPrivate(pKey);
    };
    Utils.publicKeyFromString = function (pubKeyString) {
        var pubKey = DecentLib.PublicKey.fromPublicKeyString(pubKeyString);
        return new KeyPublic(pubKey);
    };
    Utils.generatePrivateKey = function (brainKey) {
        var pKey = DecentLib.key.get_brainPrivateKey(brainKey);
        return new KeyPrivate(pKey);
    };
    return Utils;
}());
export { Utils };
var KeyPrivate = (function () {
    function KeyPrivate(privateKey) {
        this._privateKey = privateKey;
    }
    Object.defineProperty(KeyPrivate.prototype, "key", {
        get: function () {
            return this._privateKey;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(KeyPrivate.prototype, "stringKey", {
        get: function () {
            return this._privateKey.toWif();
        },
        enumerable: true,
        configurable: true
    });
    return KeyPrivate;
}());
export { KeyPrivate };
var KeyPublic = (function () {
    function KeyPublic(publicKey) {
        this._publicKey = publicKey;
    }
    Object.defineProperty(KeyPublic.prototype, "key", {
        get: function () {
            return this._publicKey;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(KeyPublic.prototype, "stringKey", {
        get: function () {
            return this._publicKey.toString();
        },
        enumerable: true,
        configurable: true
    });
    return KeyPublic;
}());
export { KeyPublic };
//# sourceMappingURL=utils.js.map