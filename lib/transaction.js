import { DecentLib } from './helpers';
import { Utils } from './utils';
var OperationName = (function () {
    function OperationName() {
    }
    OperationName.transfer = 'transfer';
    OperationName.content_cancellation = 'content_cancellation';
    OperationName.requestToBuy = 'request_to_buy';
    OperationName.content_submit = 'content_submit';
    return OperationName;
}());
export { OperationName };
var Asset = (function () {
    function Asset() {
    }
    return Asset;
}());
export { Asset };
var Transaction = (function () {
    function Transaction() {
        this._operations = [];
        this._transaction = new DecentLib.TransactionBuilder();
    }
    Object.defineProperty(Transaction.prototype, "operations", {
        get: function () {
            return this._operations;
        },
        enumerable: true,
        configurable: true
    });
    Transaction.prototype.addOperation = function (operation) {
        if (!DecentLib.ops.hasOwnProperty(operation.name)) {
            return false;
        }
        DecentLib.ops[operation.name].keys.forEach(function (key) {
            return operation.operation.hasOwnProperty(key);
        });
        this._transaction.add_type_operation(operation.name, operation.operation);
        this._operations.push(operation);
        return true;
    };
    Transaction.prototype.broadcast = function (privateKey) {
        var _this = this;
        var secret = Utils.privateKeyFromWif(privateKey);
        var pubKey = Utils.getPublicKey(secret);
        return new Promise(function (resolve, reject) {
            _this.setTransactionFees()
                .then(function () {
                _this.signTransaction(secret, pubKey);
                _this._transaction.broadcast()
                    .then(function () {
                    resolve();
                })
                    .catch(function (err) {
                    reject(err);
                });
            })
                .catch(function (err) {
                reject(err);
            });
        });
    };
    Transaction.prototype.setTransactionFees = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._transaction.set_required_fees()
                .then(function () {
                resolve();
            })
                .catch(function () {
                reject();
            });
        });
    };
    Transaction.prototype.signTransaction = function (privateKey, publicKey) {
        this._transaction.add_signer(privateKey.key, publicKey.key);
    };
    return Transaction;
}());
export { Transaction };
//# sourceMappingURL=transaction.js.map