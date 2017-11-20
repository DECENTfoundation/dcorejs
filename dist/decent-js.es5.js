import { Aes, Apis, ChainConfig, ChainStore, FetchChain, PrivateKey, PublicKey, TransactionBuilder, TransactionHelper, key, ops } from 'decentjs-lib';

var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var SearchParamsOrder = (function () {
    function SearchParamsOrder() {
    }
    SearchParamsOrder.authorAsc = '+author';
    SearchParamsOrder.ratingAsc = '+rating';
    SearchParamsOrder.sizeAsc = '+size';
    SearchParamsOrder.priceAsc = '+price';
    SearchParamsOrder.createdAsc = '+created';
    SearchParamsOrder.expirationAsc = '+expiration';
    SearchParamsOrder.authorDesc = '-author';
    SearchParamsOrder.ratingDesc = '-rating';
    SearchParamsOrder.sizeDesc = '-size';
    SearchParamsOrder.priceDesc = '-price';
    SearchParamsOrder.createdDesc = '-created';
    SearchParamsOrder.expirationDesc = '-expiration';
    return SearchParamsOrder;
}());
var SearchAccountHistoryOrder = (function () {
    function SearchAccountHistoryOrder() {
    }
    SearchAccountHistoryOrder.typeAsc = '+type';
    SearchAccountHistoryOrder.toAsc = '+to';
    SearchAccountHistoryOrder.fromAsc = '+from';
    SearchAccountHistoryOrder.priceAsc = '+price';
    SearchAccountHistoryOrder.feeAsc = '+fee';
    SearchAccountHistoryOrder.descriptionAsc = '+description';
    SearchAccountHistoryOrder.timeAsc = '+time';
    SearchAccountHistoryOrder.typeDesc = '-type';
    SearchAccountHistoryOrder.toDesc = '-to';
    SearchAccountHistoryOrder.fromDesc = '-from';
    SearchAccountHistoryOrder.priceDesc = '-price';
    SearchAccountHistoryOrder.feeDesc = '-fee';
    SearchAccountHistoryOrder.descriptionDesc = '-description';
    SearchAccountHistoryOrder.timeDesc = '-time';
    return SearchAccountHistoryOrder;
}());
var SearchParams = (function () {
    function SearchParams(term, order, user, region_code, itemId, category, count) {
        if (term === void 0) { term = ''; }
        if (order === void 0) { order = ''; }
        if (user === void 0) { user = ''; }
        if (region_code === void 0) { region_code = ''; }
        if (itemId === void 0) { itemId = ''; }
        if (category === void 0) { category = ''; }
        if (count === void 0) { count = 6; }
        this.term = '';
        this.order = '';
        this.user = '';
        this.region_code = '';
        this.itemId = '';
        this.category = '';
        this.term = term || '';
        this.order = order || SearchParamsOrder.createdDesc;
        this.user = user || '';
        this.region_code = region_code || '';
        this.itemId = itemId || '0.0.0';
        this.category = category || '1';
        this.count = count || 6;
    }
    Object.defineProperty(SearchParams.prototype, "params", {
        get: function () {
            var params = [];
            params = Object.values(this).reduce(function (previousValue, currentValue) {
                previousValue.push(currentValue);
                return previousValue;
            }, params);
            return params;
        },
        enumerable: true,
        configurable: true
    });
    return SearchParams;
}());
var DatabaseError = (function () {
    function DatabaseError() {
    }
    DatabaseError.chain_connection_failed = 'chain_connection_failed';
    DatabaseError.chain_connecting = 'chain_connecting';
    DatabaseError.database_execution_failed = 'database_execution_failed';
    return DatabaseError;
}());
var DatabaseOperationName = (function () {
    function DatabaseOperationName() {
    }
    DatabaseOperationName.searchContent = 'search_content';
    DatabaseOperationName.getAccountByName = 'get_account_by_name';
    DatabaseOperationName.getAccounts = 'get_accounts';
    DatabaseOperationName.searchAccountHistory = 'search_account_history';
    DatabaseOperationName.getAccountBalances = 'get_account_balances';
    DatabaseOperationName.generateContentKeys = 'generate_content_keys';
    DatabaseOperationName.restoreEncryptionKey = 'restore_encryption_key';
    DatabaseOperationName.getBuyingObjectsByConsumer = 'get_buying_objects_by_consumer';
    DatabaseOperationName.listPublishers = 'list_seeders_by_price';
    DatabaseOperationName.getObjects = 'get_objects';
    DatabaseOperationName.getBuyingHistoryObjects = 'get_buying_by_consumer_URI';
    return DatabaseOperationName;
}());
var DatabaseOperation = (function () {
    function DatabaseOperation(name) {
        var params = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            params[_i - 1] = arguments[_i];
        }
        this._name = name;
        this._parameters = params;
    }
    Object.defineProperty(DatabaseOperation.prototype, "name", {
        get: function () {
            return this._name;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DatabaseOperation.prototype, "parameters", {
        get: function () {
            return this._parameters;
        },
        enumerable: true,
        configurable: true
    });
    return DatabaseOperation;
}());
var DatabaseOperations;
(function (DatabaseOperations) {
    var SearchContent = (function (_super) {
        __extends(SearchContent, _super);
        function SearchContent(searchParams) {
            var _this = this;
            var _a = searchParams.params, term = _a[0], order = _a[1], user = _a[2], region_code = _a[3], itemId = _a[4], category = _a[5], count = _a[6];
            _this = _super.call(this, DatabaseOperationName.searchContent, term, order, user, region_code, itemId, category, count) || this;
            return _this;
        }
        return SearchContent;
    }(DatabaseOperation));
    DatabaseOperations.SearchContent = SearchContent;
    var GetAccountByName = (function (_super) {
        __extends(GetAccountByName, _super);
        function GetAccountByName(name) {
            return _super.call(this, DatabaseOperationName.getAccountByName, name) || this;
        }
        return GetAccountByName;
    }(DatabaseOperation));
    DatabaseOperations.GetAccountByName = GetAccountByName;
    var GetAccounts = (function (_super) {
        __extends(GetAccounts, _super);
        function GetAccounts(ids) {
            return _super.call(this, DatabaseOperationName.getAccounts, ids) || this;
        }
        return GetAccounts;
    }(DatabaseOperation));
    DatabaseOperations.GetAccounts = GetAccounts;
    var SearchAccountHistory = (function (_super) {
        __extends(SearchAccountHistory, _super);
        function SearchAccountHistory(accountId, order, startObjecId, limit) {
            if (startObjecId === void 0) { startObjecId = '0.0.0'; }
            if (limit === void 0) { limit = 100; }
            return _super.call(this, DatabaseOperationName.searchAccountHistory, accountId, order, startObjecId, limit) || this;
        }
        return SearchAccountHistory;
    }(DatabaseOperation));
    DatabaseOperations.SearchAccountHistory = SearchAccountHistory;
    var GetAccountBalances = (function (_super) {
        __extends(GetAccountBalances, _super);
        function GetAccountBalances(accountId, assetsId) {
            return _super.call(this, DatabaseOperationName.getAccountBalances, accountId, assetsId) || this;
        }
        return GetAccountBalances;
    }(DatabaseOperation));
    DatabaseOperations.GetAccountBalances = GetAccountBalances;
    var RestoreEncryptionKey = (function (_super) {
        __extends(RestoreEncryptionKey, _super);
        function RestoreEncryptionKey(contentId, elGamalPrivate) {
            return _super.call(this, DatabaseOperationName.restoreEncryptionKey, { s: elGamalPrivate }, contentId) || this;
        }
        return RestoreEncryptionKey;
    }(DatabaseOperation));
    DatabaseOperations.RestoreEncryptionKey = RestoreEncryptionKey;
    var GenerateContentKeys = (function (_super) {
        __extends(GenerateContentKeys, _super);
        function GenerateContentKeys(seeders) {
            return _super.call(this, DatabaseOperationName.generateContentKeys, seeders) || this;
        }
        return GenerateContentKeys;
    }(DatabaseOperation));
    DatabaseOperations.GenerateContentKeys = GenerateContentKeys;
    var ListSeeders = (function (_super) {
        __extends(ListSeeders, _super);
        function ListSeeders(resultSize) {
            return _super.call(this, DatabaseOperationName.listPublishers, resultSize) || this;
        }
        return ListSeeders;
    }(DatabaseOperation));
    DatabaseOperations.ListSeeders = ListSeeders;
    var GetBoughtObjectsByCustomer = (function (_super) {
        __extends(GetBoughtObjectsByCustomer, _super);
        function GetBoughtObjectsByCustomer(consumerId, order, startObjectId, term, resultSize) {
            return _super.call(this, DatabaseOperationName.getBuyingObjectsByConsumer, consumerId, order, startObjectId, term, resultSize) || this;
        }
        return GetBoughtObjectsByCustomer;
    }(DatabaseOperation));
    DatabaseOperations.GetBoughtObjectsByCustomer = GetBoughtObjectsByCustomer;
    var GetObjects = (function (_super) {
        __extends(GetObjects, _super);
        function GetObjects(ids) {
            return _super.call(this, DatabaseOperationName.getObjects, ids) || this;
        }
        return GetObjects;
    }(DatabaseOperation));
    DatabaseOperations.GetObjects = GetObjects;
    var GetBuyingHistoryObjects = (function (_super) {
        __extends(GetBuyingHistoryObjects, _super);
        function GetBuyingHistoryObjects(accountId, contentURI) {
            return _super.call(this, DatabaseOperationName.getBuyingHistoryObjects, accountId, contentURI) || this;
        }
        return GetBuyingHistoryObjects;
    }(DatabaseOperation));
    DatabaseOperations.GetBuyingHistoryObjects = GetBuyingHistoryObjects;
})(DatabaseOperations || (DatabaseOperations = {}));
var Database = (function () {
    function Database() {
    }
    return Database;
}());
var DatabaseApi = (function (_super) {
    __extends(DatabaseApi, _super);
    function DatabaseApi(config, api) {
        var _this = _super.call(this) || this;
        _this._api = api;
        return _this;
    }
    Object.defineProperty(DatabaseApi.prototype, "connectionStatus", {
        get: function () {
            return this._connectionStatus;
        },
        enumerable: true,
        configurable: true
    });
    DatabaseApi.create = function (config, api) {
        return new DatabaseApi(config, api);
    };
    DatabaseApi.prototype.dbApi = function () {
        return this._api.instance().db_api();
    };
    DatabaseApi.prototype.initApi = function (addresses, forApi) {
        var _this = this;
        forApi.setRpcConnectionStatusCallback(function (status) {
            _this._connectionStatus = status;
        });
        this._apiConnector = new Promise(function (resolve, reject) {
            _this.connectDaemon(forApi, addresses, function () {
                resolve();
            }, function (error) {
                reject(error);
            });
        });
        return this._apiConnector;
    };
    DatabaseApi.prototype.connectDaemon = function (toApi, addresses, onSuccess, onError, addressIndex) {
        var _this = this;
        if (addressIndex === void 0) { addressIndex = 0; }
        if (addresses.length === addressIndex) {
            onError(this.handleError(DatabaseError.chain_connection_failed, ''));
            return false;
        }
        var address = addresses[addressIndex];
        return toApi
            .instance(address, true)
            .init_promise.then(function () {
            onSuccess();
        })
            .catch(function (reason) {
            _this.connectDaemon(toApi, addresses, onSuccess, onError, addressIndex + 1);
        });
    };
    DatabaseApi.prototype.execute = function (operation) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._apiConnector.then(function () {
                _this.dbApi()
                    .exec(operation.name, operation.parameters)
                    .then(function (content) { return resolve(content); })
                    .catch(function (err) {
                    reject(_this.handleError(DatabaseError.database_execution_failed, err));
                });
            });
        });
    };
    DatabaseApi.prototype.handleError = function (message, err) {
        var error = new Error(message);
        error.stack = err;
        return error;
    };
    return DatabaseApi;
}(Database));

//# sourceMappingURL=database.js.map

var ChainError = (function () {
    function ChainError() {
    }
    ChainError.command_execution_failed = 'command_execution_failed';
    return ChainError;
}());
var ChainMethods = (function () {
    function ChainMethods() {
        this._commands = [];
    }
    Object.defineProperty(ChainMethods.prototype, "commands", {
        get: function () {
            return this._commands;
        },
        enumerable: true,
        configurable: true
    });
    ChainMethods.prototype.add = function (method, params) {
        this._commands.push({ name: method, param: params });
    };
    ChainMethods.getAccount = 'getAccount';
    ChainMethods.getAsset = 'getAsset';
    ChainMethods.getObject = 'getObject';
    return ChainMethods;
}());
var ChainApi = (function () {
    function ChainApi(apiConnector) {
        this._apiConnector = apiConnector;
    }
    ChainApi.generateNonce = function () {
        return TransactionHelper.unique_nonce_uint64();
    };
    ChainApi.setupChain = function (chainId, chainConfig) {
        chainConfig.networks.decent = {
            chain_id: chainId
        };
    };
    ChainApi.prototype.fetch = function (methods) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._apiConnector.then(function () {
                ChainStore.init().then(function () {
                    var commands = methods.commands
                        .map(function (op) { return FetchChain(op.name, op.param); });
                    Promise.all(commands)
                        .then(function (result) { return resolve(result); })
                        .catch(function (err) {
                        var e = new Error(ChainError.command_execution_failed);
                        e.stack = err;
                        reject(e);
                    });
                });
            });
        });
    };
    ChainApi.asset = 'DCT';
    ChainApi.asset_id = '1.3.0';
    ChainApi.DCTPower = Math.pow(10, 8);
    return ChainApi;
}());

//# sourceMappingURL=chain.js.map

var RIPEMD160 = require('ripemd160');
var CryptoUtils = (function () {
    function CryptoUtils() {
    }
    CryptoUtils.encryptWithChecksum = function (message, privateKey, publicKey, nonce) {
        if (nonce === void 0) { nonce = ''; }
        return Aes.encrypt_with_checksum(privateKey.key, publicKey.key, nonce, message);
    };
    CryptoUtils.decryptWithChecksum = function (message, privateKey, publicKey, nonce) {
        if (nonce === void 0) { nonce = ''; }
        return Aes.decrypt_with_checksum(privateKey.key, publicKey.key, nonce, message);
    };
    CryptoUtils.ripemdHash = function (fromBuffer) {
        return new RIPEMD160().update(fromBuffer).digest('hex');
    };
    return CryptoUtils;
}());

//# sourceMappingURL=crypt.js.map

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
        var pKey = PrivateKey.fromWif(pkWif);
        return new KeyPrivate(pKey);
    };
    Utils.publicKeyFromString = function (pubKeyString) {
        var pubKey = PublicKey.fromPublicKeyString(pubKeyString);
        return new KeyPublic(pubKey);
    };
    Utils.generatePrivateKey = function (brainKey) {
        var pKey = key.get_brainPrivateKey(brainKey);
        return new KeyPrivate(pKey);
    };
    return Utils;
}());
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

//# sourceMappingURL=utils.js.map

var OperationName = (function () {
    function OperationName() {
    }
    OperationName.transfer = 'transfer';
    OperationName.content_cancellation = 'content_cancellation';
    OperationName.requestToBuy = 'request_to_buy';
    OperationName.content_submit = 'content_submit';
    return OperationName;
}());
var Transaction = (function () {
    function Transaction() {
        this._operations = [];
        this._transaction = new TransactionBuilder();
    }
    Object.defineProperty(Transaction.prototype, "operations", {
        get: function () {
            return this._operations;
        },
        enumerable: true,
        configurable: true
    });
    Transaction.prototype.addOperation = function (operation) {
        if (!ops.hasOwnProperty(operation.name)) {
            return false;
        }
        ops[operation.name].keys.forEach(function (key$$1) {
            return operation.operation.hasOwnProperty(key$$1);
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

//# sourceMappingURL=transaction.js.map

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
var ContentApi = (function () {
    function ContentApi(dbApi, chainApi) {
        this._dbApi = dbApi;
        this._chainApi = chainApi;
    }
    ContentApi.prototype.searchContent = function (searchParams) {
        var _this = this;
        var dbOperation = new DatabaseOperations.SearchContent(searchParams);
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
            var dbOperation = new DatabaseOperations.GetObjects([id]);
            _this._dbApi
                .execute(dbOperation)
                .then(function (contents) {
                var content = contents[0];
                var stringidied = JSON.stringify(content);
                var objectified = JSON.parse(stringidied);
                objectified.synopsis = JSON.parse(objectified.synopsis);
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
                var methods = new ChainMethods();
                methods.add(ChainMethods.getAccount, authorId);
                var cancellation = {
                    author: authorId,
                    URI: URI
                };
                var transaction = new Transaction();
                transaction.addOperation({
                    name: OperationName.content_cancellation,
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
                var dbOperation = new DatabaseOperations.GetBuyingHistoryObjects(accountId, content.URI);
                _this._dbApi.execute(dbOperation)
                    .then(function (res) {
                    console.log(res);
                    var validKey = elGamalPrivate.find(function (elgPair) { return elgPair.publicKey === res.pubKey.s; });
                    if (!validKey) {
                        reject(_this.handleError(ContentError.restore_content_keys_failed, 'wrong keys'));
                    }
                    var dbOperation = new DatabaseOperations.RestoreEncryptionKey(contentId, validKey.privateKey);
                    _this._dbApi
                        .execute(dbOperation)
                        .then(function (key$$1) {
                        resolve(key$$1);
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
        var dbOperation = new DatabaseOperations.GenerateContentKeys(seeders);
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
                            asset_id: ChainApi.asset_id
                        }
                    }
                ],
                hash: content.hash,
                seeders: content.seeders.map(function (s) { return s.seeder; }),
                key_parts: content.keyParts,
                expiration: content.date,
                publishing_fee: {
                    amount: _this.calculateFee(content),
                    asset_id: ChainApi.asset_id
                },
                synopsis: JSON.stringify(content.synopsis)
            };
            var transaction = new Transaction();
            transaction.addOperation({
                name: OperationName.content_submit,
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
        var fee = Math.ceil(this.getFileSize(content.fileSize) *
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
                var transaction = new Transaction();
                transaction.addOperation({
                    name: OperationName.requestToBuy,
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
        var dbOperation = new DatabaseOperations.ListSeeders(resultSize);
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
        if (order === void 0) { order = SearchParamsOrder.createdDesc; }
        if (startObjectId === void 0) { startObjectId = '0.0.0'; }
        if (term === void 0) { term = ''; }
        if (resultSize === void 0) { resultSize = 100; }
        return new Promise(function (resolve, reject) {
            if (!accountId) {
                reject('missing_parameter');
                return;
            }
            var searchParams = new SearchParams();
            searchParams.count = resultSize;
            _this.searchContent(searchParams)
                .then(function (allContent) {
                var dbOperation = new DatabaseOperations.GetBoughtObjectsByCustomer(accountId, order, startObjectId, term, resultSize);
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

//# sourceMappingURL=content.js.map

var Asset$1 = (function () {
    function Asset$$1() {
    }
    Asset$$1.createAsset = function (amount, assetId) {
        return {
            amount: Math.floor(amount * ChainApi.DCTPower),
            asset_id: assetId
        };
    };
    return Asset$$1;
}());
var KeyAuth = (function () {
    function KeyAuth(key$$1, value) {
        if (value === void 0) { value = 1; }
        this._key = key$$1;
        this._value = value;
    }
    KeyAuth.prototype.keyAuthFormat = function () {
        return [this._key, this._value];
    };
    return KeyAuth;
}());
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
        var pubKey = Utils.publicKeyFromString(this.to);
        var decrypted = '';
        privateKeys.forEach(function (pk) {
            var pKey;
            try {
                pKey = Utils.privateKeyFromWif(pk);
                try {
                    decrypted = CryptoUtils.decryptWithChecksum(_this.message, pKey, pubKey, _this.nonce).toString();
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
var AccountApi = (function () {
    function AccountApi(dbApi, chainApi) {
        this._dbApi = dbApi;
        this._chainApi = chainApi;
    }
    AccountApi.prototype.getAccountByName = function (name) {
        var _this = this;
        var dbOperation = new DatabaseOperations.GetAccountByName(name);
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
        var dbOperation = new DatabaseOperations.GetAccounts([id]);
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
        if (order === void 0) { order = SearchAccountHistoryOrder.timeDesc; }
        if (startObjectId === void 0) { startObjectId = '0.0.0'; }
        if (resultLimit === void 0) { resultLimit = 100; }
        return new Promise(function (resolve, reject) {
            var dbOperation = new DatabaseOperations.SearchAccountHistory(accountId, order, startObjectId, resultLimit);
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
        var pKey = Utils.privateKeyFromWif(privateKey);
        return new Promise(function (resolve, reject) {
            if (memo && !privateKey) {
                reject(AccountError.transfer_missing_pkey);
            }
            var operations = new ChainMethods();
            operations.add(ChainMethods.getAccount, fromAccount);
            operations.add(ChainMethods.getAccount, toAccount);
            operations.add(ChainMethods.getAsset, ChainApi.asset);
            _this._chainApi.fetch(operations).then(function (result) {
                var senderAccount = result[0], receiverAccount = result[1], asset = result[2];
                if (!senderAccount) {
                    reject(_this.handleError(AccountError.transfer_sender_account_not_found, "" + fromAccount));
                }
                if (!receiverAccount) {
                    reject(_this.handleError(AccountError.transfer_receiver_account_not_found, "" + toAccount));
                }
                var nonce = ChainApi.generateNonce();
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
                var pubKey = Utils.publicKeyFromString(toPublicKey);
                var memo_object = {
                    from: fromPublicKey,
                    to: toPublicKey,
                    nonce: nonce,
                    message: CryptoUtils.encryptWithChecksum(memo, pKey, pubKey, nonce)
                };
                var transfer = {
                    from: senderAccount.get('id'),
                    to: receiverAccount.get('id'),
                    amount: Asset$1.createAsset(amount, asset.get('id')),
                    memo: memo_object
                };
                var transaction = new Transaction();
                transaction.addOperation({
                    name: OperationName.transfer,
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
            var dbOperation = new DatabaseOperations.GetAccountBalances(accountId, [
                ChainApi.asset_id
            ]);
            _this._dbApi.execute(dbOperation)
                .then(function (res) {
                resolve(res[0].amount / ChainApi.DCTPower);
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

//# sourceMappingURL=account.js.map

var Core = (function () {
    function Core() {
    }
    Object.defineProperty(Core.prototype, "content", {
        get: function () {
            return this._content;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Core.prototype, "account", {
        get: function () {
            return this._account;
        },
        enumerable: true,
        configurable: true
    });
    Core.create = function (config, api, chainConfigApi) {
        if (api === void 0) { api = Apis; }
        if (chainConfigApi === void 0) { chainConfigApi = ChainConfig; }
        var core = new Core();
        core.setupChain(config.chain_id, chainConfigApi);
        core._database = DatabaseApi.create(config, api);
        var apiConnectionPromise = core._database.initApi(config.decent_network_wspaths, api);
        core._chain = new ChainApi(apiConnectionPromise);
        core._content = new ContentApi(core._database, core._chain);
        core._account = new AccountApi(core._database, core._chain);
        return core;
    };
    Core.prototype.setupChain = function (chainId, chainConfig) {
        ChainApi.setupChain(chainId, chainConfig);
    };
    return Core;
}());

//# sourceMappingURL=core.js.map

var DecentError = (function () {
    function DecentError() {
    }
    DecentError.app_not_initialized = 'app_not_initialized';
    DecentError.app_missing_config = 'app_missing_config';
    return DecentError;
}());
var Decent = (function () {
    function Decent() {
    }
    Object.defineProperty(Decent, "core", {
        get: function () {
            if (!Decent._core) {
                throw new Error(DecentError.app_not_initialized);
            }
            return Decent._core;
        },
        enumerable: true,
        configurable: true
    });
    Decent.initialize = function (config) {
        if (config.decent_network_wspaths[0] === '' || config.chain_id === '') {
            throw new Error(DecentError.app_missing_config);
        }
        if (Decent._core) {
            return;
        }
        Decent._core = Core.create({
            decent_network_wspaths: config.decent_network_wspaths,
            chain_id: config.chain_id
        });
    };
    return Decent;
}());

//# sourceMappingURL=decent.js.map

//# sourceMappingURL=publicApi.js.map

//# sourceMappingURL=decent-js.js.map

export { Decent, Utils, SearchParams, SearchParamsOrder, ContentApi, KeyPair, TransactionRecord, Core };
//# sourceMappingURL=decent-js.es5.js.map
