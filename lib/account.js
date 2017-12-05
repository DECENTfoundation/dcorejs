"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var database_1 = require("./api/database");
var chain_1 = require("./api/chain");
var crypt_1 = require("./crypt");
var transaction_1 = require("./transaction");
var utils_1 = require("./utils");
var Asset = (function () {
    function Asset() {
    }
    Asset.createAsset = function (amount, assetId) {
        return {
            amount: Math.floor(amount * chain_1.ChainApi.DCTPower),
            asset_id: assetId
        };
    };
    return Asset;
}());
exports.Asset = Asset;
var KeyAuth = (function () {
    function KeyAuth(key, value) {
        if (value === void 0) { value = 1; }
        this._key = key;
        this._value = value;
    }
    KeyAuth.prototype.keyAuthFormat = function () {
        return [this._key, this._value];
    };
    return KeyAuth;
}());
exports.KeyAuth = KeyAuth;
var TransactionRecord = (function () {
    function TransactionRecord(transaction, privateKeys) {
        this.fromAccountId = transaction.m_from_account;
        this.toAccountId = transaction.m_to_account;
        this.operationType = transaction.m_operation_type;
        this.transactionAmount = transaction.m_transaction_amount.amount;
        this.transactionFee = transaction.m_transaction_fee.amount;
        this.description = transaction.m_str_description;
        this.timestamp = transaction.m_timestamp;
        this.memo = new TransactionMemo(transaction);
        this.memoString = this.memo.decryptedMessage(privateKeys);
        console.log("done : " + this.memoString);
    }
    return TransactionRecord;
}());
exports.TransactionRecord = TransactionRecord;
var TransactionMemo = (function () {
    function TransactionMemo(transaction) {
        if (!transaction.m_transaction_encrypted_memo) {
            this.valid = false;
        }
        else {
            this.valid = true;
            this.from = transaction.m_transaction_encrypted_memo.from;
            this.message = transaction.m_transaction_encrypted_memo.message;
            this.nonce = transaction.m_transaction_encrypted_memo.nonce;
            this.to = transaction.m_transaction_encrypted_memo.to;
        }
    }
    TransactionMemo.prototype.decryptedMessage = function (privateKeys) {
        var _this = this;
        if (!this.valid) {
            return '';
        }
        var pubKey = utils_1.Utils.publicKeyFromString(this.to);
        var decrypted = '';
        privateKeys.forEach(function (pk) {
            var pKey;
            try {
                pKey = utils_1.Utils.privateKeyFromWif(pk);
                try {
                    decrypted = crypt_1.CryptoUtils.decryptWithChecksum(_this.message, pKey, pubKey, _this.nonce).toString();
                }
                catch (err) {
                    throw new Error(AccountError.account_keys_incorrect);
                }
            }
            catch (err) {
            }
        });
        return decrypted;
    };
    return TransactionMemo;
}());
exports.TransactionMemo = TransactionMemo;
var AccountError = (function () {
    function AccountError() {
    }
    AccountError.account_does_not_exist = 'account_does_not_exist';
    AccountError.account_fetch_failed = 'account_fetch_failed';
    AccountError.transaction_history_fetch_failed = 'transaction_history_fetch_failed';
    AccountError.transfer_missing_pkey = 'transfer_missing_pkey';
    AccountError.transfer_sender_account_not_found = 'transfer_sender_account_not_found';
    AccountError.transfer_receiver_account_not_found = 'transfer_receiver_account_not_found';
    AccountError.database_operation_failed = 'database_operation_failed';
    AccountError.transaction_broadcast_failed = 'transaction_broadcast_failed';
    AccountError.account_keys_incorrect = 'account_keys_incorrect';
    return AccountError;
}());
exports.AccountError = AccountError;
var AccountApi = (function () {
    function AccountApi(dbApi, chainApi) {
        this._dbApi = dbApi;
        this._chainApi = chainApi;
    }
    AccountApi.prototype.getAccountByName = function (name) {
        var _this = this;
        var dbOperation = new database_1.DatabaseOperations.GetAccountByName(name);
        return new Promise(function (resolve, reject) {
            _this._dbApi.execute(dbOperation)
                .then(function (account) {
                resolve(account);
            })
                .catch(function (err) {
                reject(_this.handleError(AccountError.account_fetch_failed, err));
            });
        });
    };
    AccountApi.prototype.getAccountById = function (id) {
        var _this = this;
        var dbOperation = new database_1.DatabaseOperations.GetAccounts([id]);
        return new Promise(function (resolve, reject) {
            _this._dbApi.execute(dbOperation)
                .then(function (accounts) {
                if (accounts.length === 0) {
                    reject(_this.handleError(AccountError.account_does_not_exist, "" + id));
                }
                var account = accounts[0];
                resolve(account);
            })
                .catch(function (err) {
                reject(_this.handleError(AccountError.account_fetch_failed, err));
            });
        });
    };
    AccountApi.prototype.getTransactionHistory = function (accountId, privateKeys, order, startObjectId, resultLimit) {
        var _this = this;
        if (order === void 0) { order = database_1.SearchAccountHistoryOrder.timeDesc; }
        if (startObjectId === void 0) { startObjectId = '0.0.0'; }
        if (resultLimit === void 0) { resultLimit = 100; }
        return new Promise(function (resolve, reject) {
            var dbOperation = new database_1.DatabaseOperations.SearchAccountHistory(accountId, order, startObjectId, resultLimit);
            _this._dbApi.execute(dbOperation)
                .then(function (transactions) {
                console.log(transactions);
                var namePromises = [];
                var res = transactions.map(function (tr) {
                    var transaction = new TransactionRecord(tr, privateKeys);
                    namePromises.push(new Promise(function (resolve, reject) {
                        _this.getAccountById(transaction.fromAccountId)
                            .then(function (account) {
                            transaction.fromAccountName = account.name;
                            resolve();
                        })
                            .catch(function (err) { return reject(_this.handleError(AccountError.account_fetch_failed, err)); });
                    }));
                    namePromises.push(new Promise(function (resolve, reject) {
                        _this.getAccountById(transaction.toAccountId)
                            .then(function (account) {
                            transaction.toAccountName = account.name;
                            resolve();
                        })
                            .catch(function (err) { return reject(_this.handleError(AccountError.account_fetch_failed, err)); });
                    }));
                    return transaction;
                });
                Promise.all(namePromises)
                    .then(function () {
                    resolve(res);
                })
                    .catch(function (err) {
                    reject(_this.handleError(AccountError.account_fetch_failed, err));
                });
            })
                .catch(function (err) {
                reject(_this.handleError(AccountError.transaction_history_fetch_failed, err));
            });
        });
    };
    AccountApi.prototype.transfer = function (amount, fromAccount, toAccount, memo, privateKey) {
        var _this = this;
        var pKey = utils_1.Utils.privateKeyFromWif(privateKey);
        return new Promise(function (resolve, reject) {
            if (memo && !privateKey) {
                reject(AccountError.transfer_missing_pkey);
            }
            var operations = new chain_1.ChainMethods();
            operations.add(chain_1.ChainMethods.getAccount, fromAccount);
            operations.add(chain_1.ChainMethods.getAccount, toAccount);
            operations.add(chain_1.ChainMethods.getAsset, chain_1.ChainApi.asset);
            _this._chainApi.fetch(operations).then(function (result) {
                var senderAccount = result[0], receiverAccount = result[1], asset = result[2];
                if (!senderAccount) {
                    reject(_this.handleError(AccountError.transfer_sender_account_not_found, "" + fromAccount));
                }
                if (!receiverAccount) {
                    reject(_this.handleError(AccountError.transfer_receiver_account_not_found, "" + toAccount));
                }
                var nonce = chain_1.ChainApi.generateNonce();
                var fromPublicKey = senderAccount
                    .get('owner')
                    .get('key_auths')
                    .get(0)
                    .get(0);
                var toPublicKey = receiverAccount
                    .get('owner')
                    .get('key_auths')
                    .get(0)
                    .get(0);
                var pubKey = utils_1.Utils.publicKeyFromString(toPublicKey);
                var memo_object = {
                    from: fromPublicKey,
                    to: toPublicKey,
                    nonce: nonce,
                    message: crypt_1.CryptoUtils.encryptWithChecksum(memo, pKey, pubKey, nonce)
                };
                var transfer = {
                    from: senderAccount.get('id'),
                    to: receiverAccount.get('id'),
                    amount: Asset.createAsset(amount, asset.get('id')),
                    memo: memo_object
                };
                var transaction = new transaction_1.Transaction();
                transaction.addOperation({
                    name: transaction_1.OperationName.transfer,
                    operation: transfer
                });
                transaction.broadcast(privateKey)
                    .then(function (res) {
                    resolve();
                })
                    .catch(function (err) {
                    reject(_this.handleError(AccountError.transaction_broadcast_failed, err));
                });
            });
        });
    };
    AccountApi.prototype.getBalance = function (accountId) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (!accountId) {
                reject('missing_parameter');
                return;
            }
            var dbOperation = new database_1.DatabaseOperations.GetAccountBalances(accountId, [
                chain_1.ChainApi.asset_id
            ]);
            _this._dbApi.execute(dbOperation)
                .then(function (res) {
                resolve(res[0].amount / chain_1.ChainApi.DCTPower);
            })
                .catch(function (err) {
                reject(_this.handleError(AccountError.database_operation_failed, err));
            });
        });
    };
    AccountApi.prototype.handleError = function (message, err) {
        var error = new Error(message);
        error.stack = err;
        return error;
    };
    return AccountApi;
}());
exports.AccountApi = AccountApi;
//# sourceMappingURL=account.js.map