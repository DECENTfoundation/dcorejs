"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var database_1 = require("./api/database");
var chain_1 = require("./api/chain");
var transaction_1 = require("./transaction");
var util_1 = require("util");
var moment = require('moment');
var ContentError = (function () {
    function ContentError() {
    }
    ContentError.database_operation_failed = 'operation_failed';
    ContentError.fetch_content_failed = 'fetch_content_failed';
    ContentError.transaction_broadcast_failed = 'transaction_broadcast_failed';
    ContentError.restore_content_keys_failed = 'restore_content_keys_failed';
    return ContentError;
}());
exports.ContentError = ContentError;
var KeyPair = (function () {
    function KeyPair(privateKey, publicKey) {
        this._private = privateKey;
        this._public = publicKey;
    }
    Object.defineProperty(KeyPair.prototype, "privateKey", {
        get: function () {
            return this._private;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(KeyPair.prototype, "publicKey", {
        get: function () {
            return this._public;
        },
        enumerable: true,
        configurable: true
    });
    return KeyPair;
}());
exports.KeyPair = KeyPair;
var ContentType = (function () {
    function ContentType(appId, category, subCategory, isInappropriate) {
        this._appId = appId;
        this._category = category;
        this._subCategory = subCategory;
        this._isInappropriate = isInappropriate;
    }
    ContentType.prototype.getId = function () {
        return this._appId + "." + this._category + "." + this._subCategory + "." + this
            ._isInappropriate;
    };
    return ContentType;
}());
exports.ContentType = ContentType;
var Status = (function () {
    function Status() {
    }
    Status.Uploaded = 'Uploaded';
    Status.Partially_uploaded = 'Partially uploaded';
    Status.Uploading = 'Uploading';
    Status.Expired = 'Expired';
    return Status;
}());
exports.Status = Status;
var ContentApi = (function () {
    function ContentApi(dbApi, chainApi) {
        this._dbApi = dbApi;
        this._chainApi = chainApi;
    }
    ContentApi.prototype.searchContent = function (searchParams) {
        var _this = this;
        var dbOperation = new database_1.DatabaseOperations.SearchContent(searchParams);
        return new Promise(function (resolve, reject) {
            _this._dbApi
                .execute(dbOperation)
                .then(function (content) {
                content.forEach(function (c) {
                    c.synopsis = JSON.parse(c.synopsis);
                });
                resolve(content);
            })
                .catch(function (err) {
                reject(_this.handleError(ContentError.database_operation_failed, err));
            });
        });
    };
    ContentApi.prototype.getContent = function (id) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var dbOperation = new database_1.DatabaseOperations.GetObjects([id]);
            _this._dbApi
                .execute(dbOperation)
                .then(function (contents) {
                var content = contents[0];
                var stringidied = JSON.stringify(content);
                var objectified = JSON.parse(stringidied);
                objectified.synopsis = JSON.parse(objectified.synopsis);
                if (util_1.isUndefined(objectified.price['amount'])) {
                    objectified.price = objectified.price['map_price'][0][1];
                }
                resolve(objectified);
            })
                .catch(function (err) {
                reject(err);
            });
        });
    };
    ContentApi.prototype.removeContent = function (contentId, authorId, privateKey) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.getContent(contentId)
                .then(function (content) {
                var URI = content.URI;
                var methods = new chain_1.ChainMethods();
                methods.add(chain_1.ChainMethods.getAccount, authorId);
                var cancellation = {
                    author: authorId,
                    URI: URI
                };
                var transaction = new transaction_1.Transaction();
                transaction.addOperation({
                    name: transaction_1.OperationName.content_cancellation,
                    operation: cancellation
                });
                transaction
                    .broadcast(privateKey)
                    .then(function () {
                    resolve();
                })
                    .catch(function (err) {
                    reject(_this.handleError(ContentError.transaction_broadcast_failed, err));
                });
            })
                .catch(function (err) {
                reject(_this.handleError(ContentError.fetch_content_failed, err));
            });
        });
    };
    ContentApi.prototype.restoreContentKeys = function (contentId, accountId) {
        var _this = this;
        var elGamalPrivate = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            elGamalPrivate[_i - 2] = arguments[_i];
        }
        return new Promise(function (resolve, reject) {
            _this.getContent(contentId)
                .then(function (content) {
                var dbOperation = new database_1.DatabaseOperations.GetBuyingHistoryObjects(accountId, content.URI);
                _this._dbApi.execute(dbOperation)
                    .then(function (res) {
                    console.log(res);
                    var validKey = elGamalPrivate.find(function (elgPair) { return elgPair.publicKey === res.pubKey.s; });
                    if (!validKey) {
                        reject(_this.handleError(ContentError.restore_content_keys_failed, 'wrong keys'));
                    }
                    var dbOperation = new database_1.DatabaseOperations.RestoreEncryptionKey(contentId, validKey.privateKey);
                    _this._dbApi
                        .execute(dbOperation)
                        .then(function (key) {
                        resolve(key);
                    })
                        .catch(function (err) {
                        reject(_this.handleError(ContentError.restore_content_keys_failed, err));
                    });
                });
            });
        });
    };
    ContentApi.prototype.generateContentKeys = function (seeders) {
        var _this = this;
        var dbOperation = new database_1.DatabaseOperations.GenerateContentKeys(seeders);
        return new Promise(function (resolve, reject) {
            _this._dbApi
                .execute(dbOperation)
                .then(function (keys) {
                resolve(keys);
            })
                .catch(function (err) {
                reject(_this.handleError(ContentError.database_operation_failed, err));
            });
        });
    };
    ContentApi.prototype.addContent = function (content, privateKey) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            content.size = _this.getFileSize(content.size);
            var submitOperation = {
                size: content.size,
                author: content.authorId,
                co_authors: [],
                URI: content.URI,
                quorum: content.seeders.length,
                price: [
                    {
                        region: 1,
                        price: {
                            amount: content.price,
                            asset_id: chain_1.ChainApi.asset_id
                        }
                    }
                ],
                hash: content.hash,
                seeders: content.seeders.map(function (s) { return s.seeder; }),
                key_parts: content.keyParts,
                expiration: content.date,
                publishing_fee: {
                    amount: _this.calculateFee(content),
                    asset_id: chain_1.ChainApi.asset_id
                },
                synopsis: JSON.stringify(content.synopsis)
            };
            var transaction = new transaction_1.Transaction();
            transaction.addOperation({
                name: transaction_1.OperationName.content_submit,
                operation: submitOperation
            });
            transaction
                .broadcast(privateKey)
                .then(function () {
                resolve();
            })
                .catch(function (err) {
                reject(_this.handleError(ContentError.transaction_broadcast_failed, err));
            });
        });
    };
    ContentApi.prototype.getFileSize = function (fileSize) {
        return Math.ceil(fileSize / (1024 * 1024));
    };
    ContentApi.prototype.calculateFee = function (content) {
        var num_days = moment(content.date).diff(moment(), 'days') + 1;
        var fee = Math.ceil(this.getFileSize(content.size) *
            content.seeders.reduce(function (fee, seed) { return fee + seed.price.amount * num_days; }, 0));
        return fee;
    };
    ContentApi.prototype.buyContent = function (contentId, buyerId, elGammalPub, privateKey) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.getContent(contentId)
                .then(function (content) {
                var buyOperation = {
                    URI: content.URI,
                    consumer: buyerId,
                    price: content.price,
                    region_code_from: 1,
                    pubKey: { s: elGammalPub }
                };
                var transaction = new transaction_1.Transaction();
                transaction.addOperation({
                    name: transaction_1.OperationName.requestToBuy,
                    operation: buyOperation
                });
                transaction
                    .broadcast(privateKey)
                    .then(function () {
                    resolve();
                })
                    .catch(function (err) {
                    reject(_this.handleError(ContentError.transaction_broadcast_failed, err));
                });
            })
                .catch(function (err) {
                reject(_this.handleError(ContentError.fetch_content_failed, err));
            });
        });
    };
    ContentApi.prototype.getSeeders = function (resultSize) {
        var _this = this;
        if (resultSize === void 0) { resultSize = 100; }
        var dbOperation = new database_1.DatabaseOperations.ListSeeders(resultSize);
        return new Promise(function (resolve, reject) {
            _this._dbApi
                .execute(dbOperation)
                .then(function (result) {
                resolve(result);
            })
                .catch(function (err) {
                reject(_this.handleError(ContentError.database_operation_failed, err));
            });
        });
    };
    ContentApi.prototype.getPurchasedContent = function (accountId, order, startObjectId, term, resultSize) {
        var _this = this;
        if (order === void 0) { order = database_1.SearchParamsOrder.createdDesc; }
        if (startObjectId === void 0) { startObjectId = '0.0.0'; }
        if (term === void 0) { term = ''; }
        if (resultSize === void 0) { resultSize = 100; }
        return new Promise(function (resolve, reject) {
            if (!accountId) {
                reject('missing_parameter');
                return;
            }
            var searchParams = new database_1.SearchParams();
            searchParams.count = resultSize;
            _this.searchContent(searchParams)
                .then(function (allContent) {
                var dbOperation = new database_1.DatabaseOperations.GetBoughtObjectsByCustomer(accountId, order, startObjectId, term, resultSize);
                _this._dbApi
                    .execute(dbOperation)
                    .then(function (boughtContent) {
                    var result = [];
                    boughtContent.forEach(function (bought) {
                        allContent.forEach(function (content) {
                            if (bought.URI === content.URI) {
                                bought.synopsis = JSON.parse(bought.synopsis);
                                content.buy_id = bought.id;
                                result.push(content);
                            }
                        });
                    });
                    resolve(result);
                })
                    .catch(function (err) {
                    reject(_this.handleError(ContentError.database_operation_failed, err));
                });
            })
                .catch(function (err) {
                reject(_this.handleError(ContentError.fetch_content_failed, err));
            });
        });
    };
    ContentApi.prototype.handleError = function (message, err) {
        var error = new Error(message);
        error.stack = err;
        return error;
    };
    return ContentApi;
}());
exports.ContentApi = ContentApi;
//# sourceMappingURL=content.js.map