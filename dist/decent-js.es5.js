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
var DatabaseError = /** @class */ (function () {
    function DatabaseError() {
    }
    DatabaseError.chain_connection_failed = 'chain_connection_failed';
    DatabaseError.chain_connecting = 'chain_connecting';
    DatabaseError.database_execution_failed = 'database_execution_failed';
    return DatabaseError;
}());
var DatabaseOperation = /** @class */ (function () {
    function DatabaseOperation() {
    }
    DatabaseOperation.searchContent = 'search_content';
    DatabaseOperation.getAccountByName = 'get_account_by_name';
    DatabaseOperation.getAccounts = 'get_accounts';
    DatabaseOperation.searchAccountHistory = 'search_account_history';
    DatabaseOperation.getAccountBalances = 'get_account_balances';
    DatabaseOperation.generateContentKeys = 'generate_content_keys';
    DatabaseOperation.restoreEncryptionKey = 'restore_encryption_key';
    return DatabaseOperation;
}());
var Database = /** @class */ (function () {
    function Database() {
    }
    return Database;
}());
var DatabaseApi = /** @class */ (function (_super) {
    __extends(DatabaseApi, _super);
    function DatabaseApi(config, api, chainStore) {
        var _this = _super.call(this) || this;
        _this._config = config;
        _this._api = api;
        return _this;
    }
    DatabaseApi.create = function (config, api, chainStore) {
        return new DatabaseApi(config, api, chainStore);
    };
    DatabaseApi.prototype.dbApi = function () {
        return this._api.instance().db_api();
    };
    DatabaseApi.prototype.initApi = function (addresses, forApi) {
        var _this = this;
        // TODO: when not connected yet, calls throws errors
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
        if (addresses.length <= addressIndex) {
            onError(DatabaseError.chain_connection_failed);
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
    DatabaseApi.prototype.execute = function (operation, parameters) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._apiConnector.then(function () {
                _this.dbApi()
                    .exec(operation, parameters)
                    .then(function (content) { return resolve(content); })
                    .catch(function (err) {
                    // TODO: handle errors to DBApi errors
                    reject(DatabaseError.database_execution_failed);
                });
            });
        });
    };
    return DatabaseApi;
}(Database));

var _a$1 = require('decentjs-lib/lib');
var FetchChain = _a$1.FetchChain;
var TransactionHelper = _a$1.TransactionHelper;
var ChainStore$1 = _a$1.ChainStore;
/**
 * Listing of methods available to be called
 * in blockchain.
 */
var ChainMethods = /** @class */ (function () {
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
var ChainApi = /** @class */ (function () {
    function ChainApi(apiConnector) {
        this._apiConnector = apiConnector;
    }
    /**
     * Generates random sequence of bytes
     */
    ChainApi.generateNonce = function () {
        return TransactionHelper.unique_nonce_uint64();
    };
    ChainApi.setupChain = function (chainId, chainConfig) {
        chainConfig.networks.decent = {
            chain_id: chainId
        };
    };
    /**
     * Fetches data from blockchain with given chain methods.
     *
     * Returns Promise.all with resolve result as array of results
     * in order of adding into ChainMethod
     *
     * @param {ChainMethods} methods
     * @return {Promise<any[]>}
     */
    ChainApi.prototype.fetch = function (methods) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._apiConnector.then(function () {
                ChainStore$1.init().then(function () {
                    var commands = methods.commands.map(function (op) { return FetchChain(op.name, op.param); });
                    Promise.all(commands)
                        .then(function (result) { return resolve(result); })
                        .catch(function (err) { return reject(err); });
                });
            });
        });
    };
    ChainApi.asset = 'DCT';
    ChainApi.asset_id = '1.3.0';
    return ChainApi;
}());

var _a$2 = require('decentjs-lib/lib');
var TransactionBuilder = _a$2.TransactionBuilder;
var ops = _a$2.ops;
/**
 * Class contains available transaction operation names constants
 */
var TransactionOperationName = /** @class */ (function () {
    function TransactionOperationName() {
    }
    TransactionOperationName.transfer = 'transfer';
    TransactionOperationName.content_cancellation = 'content_cancellation';
    TransactionOperationName.requestToBuy = 'request_to_buy';
    TransactionOperationName.content_submit = 'content_submit';
    return TransactionOperationName;
}());
/**
 * // TODO: Create wrapper class for TransactionBuilder for stronger typing
 * Provides methods to manipulate and broadcast transactions to
 * network.
 */
var TransactionOperator = /** @class */ (function () {
    function TransactionOperator() {
    }
    TransactionOperator.createTransaction = function () {
        return new TransactionBuilder();
    };
    TransactionOperator.createAsset = function (amount, assetId) {
        return {
            amount: Math.floor(amount * TransactionOperator.DCTPower),
            asset_id: assetId
        };
    };
    /**
       * Add requested operation to transaction object.
       *
       * If operation does not exist or data property of
       * operation object does not match required properties
       * false is returned.
       *
       * @param {TransactionOperation} operation
       * @param transaction TransactionBuilder instance
       * @return {boolean}
       */
    TransactionOperator.addOperation = function (operation, transaction) {
        if (!ops.hasOwnProperty(operation.name)) {
            return false;
        }
        ops[operation.name].keys.forEach(function (key) {
            if (!operation.operation.hasOwnProperty(key)) {
                return false;
            }
        });
        transaction.add_type_operation(operation.name, operation.operation);
        return true;
    };
    /**
       * broadcastTransaction will set required fees for operation,
       * sign operation with public/private keys and broadcast is
       * to blockchain
       *
       * @param transaction TransactionBuilder instance with requested operations
       * @param {string} privateKey
       * @param {string} publicKey
       * @return {Promise<any>}
       */
    TransactionOperator.broadcastTransaction = function (transaction, privateKey, publicKey) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.setTransactionFees(transaction)
                .then(function () {
                transaction.add_signer(privateKey, publicKey);
                transaction
                    .broadcast()
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
    /**
       * Set transaction fee required for transaction operation
       * @param transaction TransactionBuilder instance
       * @return {Promise<any>}
       */
    TransactionOperator.setTransactionFees = function (transaction) {
        return new Promise(function (resolve, reject) {
            transaction
                .set_required_fees()
                .then(function () {
                resolve();
            })
                .catch(function () {
                // TODO: error handling
                reject();
            });
        });
    };
    TransactionOperator.DCTPower = Math.pow(10, 8);
    return TransactionOperator;
}());

var moment = require('moment');
var ContentType = /** @class */ (function () {
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
var SearchParamsOrder = /** @class */ (function () {
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
/**
 * Parameters for content search.
 * Order parameter options can be found in SearchParamsOrder class
 * Region code is ISO 3166-1 alpha-2 two-letter region code.
 */
var SearchParams = /** @class */ (function () {
    function SearchParams(term, order, user, region_code, itemId, category, count) {
        if (term === void 0) { term = ''; }
        if (order === void 0) { order = ''; }
        if (user === void 0) { user = ''; }
        if (region_code === void 0) { region_code = ''; }
        if (itemId === void 0) { itemId = ''; }
        if (count === void 0) { count = 6; }
        this.term = '';
        this.order = '';
        this.user = '';
        this.region_code = '';
        this.itemId = '';
        this.category = '';
        this.term = term || '';
        this.order = order || '';
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
/**
 * ContentApi provide methods to communication
 * with content stored in decent network.
 */
var ContentApi = /** @class */ (function () {
    function ContentApi(dbApi, chainApi) {
        this._dbApi = dbApi;
        this._chainApi = chainApi;
    }
    ContentApi.prototype.searchContent = function (searchParams) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._dbApi
                .execute(DatabaseOperation.searchContent, searchParams.params)
                .then(function (content) {
                resolve(content);
            })
                .catch(function (err) {
                reject(err);
            });
        });
    };
    ContentApi.prototype.getContent = function (id) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var chainOps = new ChainMethods();
            chainOps.add(ChainMethods.getObject, id);
            _this._chainApi
                .fetch(chainOps)
                .then(function (response) {
                var content = response[0];
                var stringidied = JSON.stringify(content);
                var objectified = JSON.parse(stringidied);
                resolve(objectified);
            })
                .catch(function (err) {
                reject(err);
            });
        });
    };
    /**
       * Cancel submitted content record from blockchain.
       *
       * @param {string} URI example: 'ipfs:abc78b7a9b7a98b7c98cb798c7b9a8bc9a87bc98a9bc'
       * @param {string} authorId example: '1.2.532'
       * @param {string} privateKey
       * @return {Promise<any>}
       */
    ContentApi.prototype.removeContent = function (URI, authorId, privateKey) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var methods = new ChainMethods();
            methods.add(ChainMethods.getAccount, authorId);
            _this._chainApi.fetch(methods).then(function (result) {
                var account = result[0];
                var publicKey = account
                    .get('owner')
                    .get('key_auths')
                    .get(0)
                    .get(0);
                var transaction = TransactionOperator.createTransaction();
                var cancellation = {
                    author: authorId,
                    URI: URI
                };
                TransactionOperator.addOperation({
                    name: TransactionOperationName.content_cancellation,
                    operation: cancellation
                }, transaction);
                TransactionOperator.broadcastTransaction(transaction, privateKey, publicKey)
                    .then(function () {
                    resolve();
                })
                    .catch(function () {
                    reject();
                });
            });
        });
    };
    /**
       * Restores key to decrypt downloaded content.
       *
       * ElGammalPrivate key is used to identify if user have bought content.
       *
       * @param {String} contentId example: '1.2.453'
       * @param {string} elGammalPrivate
       * @return {Promise<string>} Key to decrypt content
       */
    ContentApi.prototype.restoreContentKeys = function (contentId, elGammalPrivate) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._dbApi
                .execute(DatabaseOperation.restoreEncryptionKey, [
                { s: elGammalPrivate },
                contentId
            ])
                .then(function (key) {
                resolve(key);
            })
                .catch(function (err) {
                reject(err);
            });
        });
    };
    /**
       * Obtains content key with key parts of each seeder to encrypt
       * content to be uploaded.
       *
       * @param {string[]} seeders Array of seeders ids example: ['1.2.12', '1.4.13']
       * @return {Promise<any>}
       */
    ContentApi.prototype.generateContentKeys = function (seeders) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._dbApi
                .execute(DatabaseOperation.generateContentKeys, [seeders])
                .then(function (keys) {
                resolve(keys);
            })
                .catch(function (err) {
                reject(err);
            });
        });
    };
    /**
       * Submit content to blockchain
       * Need to supply control checksum 'ripemdHash' and
       * 'key' generated by seeders in getContentKeys
       *
       * @param {SubmitObject} content
       * @param {string} privateKey
       * @param {string} publicKey
       * @return {Promise<any>}
       */
    ContentApi.prototype.addContent = function (content, privateKey, publicKey) {
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
            var transaction = TransactionOperator.createTransaction();
            TransactionOperator.addOperation({
                name: TransactionOperationName.content_submit,
                operation: submitOperation
            }, transaction);
            TransactionOperator.broadcastTransaction(transaction, privateKey, publicKey)
                .then(function () {
                resolve();
            })
                .catch(function (err) {
                reject(err);
            });
        });
    };
    ContentApi.prototype.getFileSize = function (fileSize) {
        return Math.ceil(fileSize / (1024 * 1024));
    };
    ContentApi.prototype.calculateFee = function (content) {
        var num_days = moment(content.date).diff(moment(), 'days') + 1;
        return Math.ceil(this.getFileSize(content.fileSize) *
            content.seeders.reduce(function (fee, seed) { return fee + seed.price.amount * num_days; }, 0));
    };
    /**
       * Request buy content.
       *
       * @param {string} contentId Id of content to be bought, example: '1.2.123'
       * @param {string} buyerId Account id of user buying content, example: '1.2.123'
       * @param {string} elGammalPub ElGammal public key which will be used to identify users bought content
       * @param {string} privateKey
       * @param {string} pubKey
       * @return {Promise<any>}
       */
    ContentApi.prototype.buyContent = function (contentId, buyerId, elGammalPub, privateKey, pubKey) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.getContent(contentId)
                .then(function (content) {
                var transaction = TransactionOperator.createTransaction();
                var buyOperation = {
                    URI: content.URI,
                    consumer: buyerId,
                    price: content.price,
                    region_code_from: 1,
                    pubKey: { s: elGammalPub }
                };
                TransactionOperator.addOperation({
                    name: TransactionOperationName.requestToBuy,
                    operation: buyOperation
                }, transaction);
                TransactionOperator.broadcastTransaction(transaction, privateKey, pubKey)
                    .then(function () {
                    resolve();
                })
                    .catch(function (err) {
                    reject();
                });
            })
                .catch(function (err) {
                reject(err);
            });
        });
    };
    return ContentApi;
}());

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};





function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

"use strict";
// CommonJS / Node have global context exposed as "global" variable.
// We don't want to include the whole node.d.ts this this compilation unit so we'll just fake
// the global "global" var for now.
var __window = typeof window !== 'undefined' && window;
var __self = typeof self !== 'undefined' && typeof WorkerGlobalScope !== 'undefined' &&
    self instanceof WorkerGlobalScope && self;
var __global = typeof commonjsGlobal !== 'undefined' && commonjsGlobal;
var _root = __window || __global || __self;
var root_1 = _root;
// Workaround Closure Compiler restriction: The body of a goog.module cannot use throw.
// This is needed when used with angular/tsickle which inserts a goog.module statement.
// Wrap in IIFE
(function () {
    if (!_root) {
        throw new Error('RxJS could not find any global context (window, self, global)');
    }
})();


var root = {
	root: root_1
};

"use strict";
function isFunction(x) {
    return typeof x === 'function';
}
var isFunction_2 = isFunction;


var isFunction_1 = {
	isFunction: isFunction_2
};

"use strict";
var isArray_1 = Array.isArray || (function (x) { return x && typeof x.length === 'number'; });


var isArray = {
	isArray: isArray_1
};

"use strict";
function isObject(x) {
    return x != null && typeof x === 'object';
}
var isObject_2 = isObject;


var isObject_1 = {
	isObject: isObject_2
};

"use strict";
// typeof any so that it we don't have to cast when comparing a result to the error object
var errorObject_1 = { e: {} };


var errorObject = {
	errorObject: errorObject_1
};

"use strict";

var tryCatchTarget;
function tryCatcher() {
    try {
        return tryCatchTarget.apply(this, arguments);
    }
    catch (e) {
        errorObject.errorObject.e = e;
        return errorObject.errorObject;
    }
}
function tryCatch(fn) {
    tryCatchTarget = fn;
    return tryCatcher;
}
var tryCatch_2 = tryCatch;



var tryCatch_1 = {
	tryCatch: tryCatch_2
};

"use strict";
var __extends$2 = (commonjsGlobal && commonjsGlobal.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * An error thrown when one or more errors have occurred during the
 * `unsubscribe` of a {@link Subscription}.
 */
var UnsubscriptionError = (function (_super) {
    __extends$2(UnsubscriptionError, _super);
    function UnsubscriptionError(errors) {
        _super.call(this);
        this.errors = errors;
        var err = Error.call(this, errors ?
            errors.length + " errors occurred during unsubscription:\n  " + errors.map(function (err, i) { return ((i + 1) + ") " + err.toString()); }).join('\n  ') : '');
        this.name = err.name = 'UnsubscriptionError';
        this.stack = err.stack;
        this.message = err.message;
    }
    return UnsubscriptionError;
}(Error));
var UnsubscriptionError_2 = UnsubscriptionError;


var UnsubscriptionError_1 = {
	UnsubscriptionError: UnsubscriptionError_2
};

"use strict";






/**
 * Represents a disposable resource, such as the execution of an Observable. A
 * Subscription has one important method, `unsubscribe`, that takes no argument
 * and just disposes the resource held by the subscription.
 *
 * Additionally, subscriptions may be grouped together through the `add()`
 * method, which will attach a child Subscription to the current Subscription.
 * When a Subscription is unsubscribed, all its children (and its grandchildren)
 * will be unsubscribed as well.
 *
 * @class Subscription
 */
var Subscription = (function () {
    /**
     * @param {function(): void} [unsubscribe] A function describing how to
     * perform the disposal of resources when the `unsubscribe` method is called.
     */
    function Subscription(unsubscribe) {
        /**
         * A flag to indicate whether this Subscription has already been unsubscribed.
         * @type {boolean}
         */
        this.closed = false;
        this._parent = null;
        this._parents = null;
        this._subscriptions = null;
        if (unsubscribe) {
            this._unsubscribe = unsubscribe;
        }
    }
    /**
     * Disposes the resources held by the subscription. May, for instance, cancel
     * an ongoing Observable execution or cancel any other type of work that
     * started when the Subscription was created.
     * @return {void}
     */
    Subscription.prototype.unsubscribe = function () {
        var hasErrors = false;
        var errors;
        if (this.closed) {
            return;
        }
        var _a = this, _parent = _a._parent, _parents = _a._parents, _unsubscribe = _a._unsubscribe, _subscriptions = _a._subscriptions;
        this.closed = true;
        this._parent = null;
        this._parents = null;
        // null out _subscriptions first so any child subscriptions that attempt
        // to remove themselves from this subscription will noop
        this._subscriptions = null;
        var index = -1;
        var len = _parents ? _parents.length : 0;
        // if this._parent is null, then so is this._parents, and we
        // don't have to remove ourselves from any parent subscriptions.
        while (_parent) {
            _parent.remove(this);
            // if this._parents is null or index >= len,
            // then _parent is set to null, and the loop exits
            _parent = ++index < len && _parents[index] || null;
        }
        if (isFunction_1.isFunction(_unsubscribe)) {
            var trial = tryCatch_1.tryCatch(_unsubscribe).call(this);
            if (trial === errorObject.errorObject) {
                hasErrors = true;
                errors = errors || (errorObject.errorObject.e instanceof UnsubscriptionError_1.UnsubscriptionError ?
                    flattenUnsubscriptionErrors(errorObject.errorObject.e.errors) : [errorObject.errorObject.e]);
            }
        }
        if (isArray.isArray(_subscriptions)) {
            index = -1;
            len = _subscriptions.length;
            while (++index < len) {
                var sub = _subscriptions[index];
                if (isObject_1.isObject(sub)) {
                    var trial = tryCatch_1.tryCatch(sub.unsubscribe).call(sub);
                    if (trial === errorObject.errorObject) {
                        hasErrors = true;
                        errors = errors || [];
                        var err = errorObject.errorObject.e;
                        if (err instanceof UnsubscriptionError_1.UnsubscriptionError) {
                            errors = errors.concat(flattenUnsubscriptionErrors(err.errors));
                        }
                        else {
                            errors.push(err);
                        }
                    }
                }
            }
        }
        if (hasErrors) {
            throw new UnsubscriptionError_1.UnsubscriptionError(errors);
        }
    };
    /**
     * Adds a tear down to be called during the unsubscribe() of this
     * Subscription.
     *
     * If the tear down being added is a subscription that is already
     * unsubscribed, is the same reference `add` is being called on, or is
     * `Subscription.EMPTY`, it will not be added.
     *
     * If this subscription is already in an `closed` state, the passed
     * tear down logic will be executed immediately.
     *
     * @param {TeardownLogic} teardown The additional logic to execute on
     * teardown.
     * @return {Subscription} Returns the Subscription used or created to be
     * added to the inner subscriptions list. This Subscription can be used with
     * `remove()` to remove the passed teardown logic from the inner subscriptions
     * list.
     */
    Subscription.prototype.add = function (teardown) {
        if (!teardown || (teardown === Subscription.EMPTY)) {
            return Subscription.EMPTY;
        }
        if (teardown === this) {
            return this;
        }
        var subscription = teardown;
        switch (typeof teardown) {
            case 'function':
                subscription = new Subscription(teardown);
            case 'object':
                if (subscription.closed || typeof subscription.unsubscribe !== 'function') {
                    return subscription;
                }
                else if (this.closed) {
                    subscription.unsubscribe();
                    return subscription;
                }
                else if (typeof subscription._addParent !== 'function' /* quack quack */) {
                    var tmp = subscription;
                    subscription = new Subscription();
                    subscription._subscriptions = [tmp];
                }
                break;
            default:
                throw new Error('unrecognized teardown ' + teardown + ' added to Subscription.');
        }
        var subscriptions = this._subscriptions || (this._subscriptions = []);
        subscriptions.push(subscription);
        subscription._addParent(this);
        return subscription;
    };
    /**
     * Removes a Subscription from the internal list of subscriptions that will
     * unsubscribe during the unsubscribe process of this Subscription.
     * @param {Subscription} subscription The subscription to remove.
     * @return {void}
     */
    Subscription.prototype.remove = function (subscription) {
        var subscriptions = this._subscriptions;
        if (subscriptions) {
            var subscriptionIndex = subscriptions.indexOf(subscription);
            if (subscriptionIndex !== -1) {
                subscriptions.splice(subscriptionIndex, 1);
            }
        }
    };
    Subscription.prototype._addParent = function (parent) {
        var _a = this, _parent = _a._parent, _parents = _a._parents;
        if (!_parent || _parent === parent) {
            // If we don't have a parent, or the new parent is the same as the
            // current parent, then set this._parent to the new parent.
            this._parent = parent;
        }
        else if (!_parents) {
            // If there's already one parent, but not multiple, allocate an Array to
            // store the rest of the parent Subscriptions.
            this._parents = [parent];
        }
        else if (_parents.indexOf(parent) === -1) {
            // Only add the new parent to the _parents list if it's not already there.
            _parents.push(parent);
        }
    };
    Subscription.EMPTY = (function (empty) {
        empty.closed = true;
        return empty;
    }(new Subscription()));
    return Subscription;
}());
var Subscription_2 = Subscription;
function flattenUnsubscriptionErrors(errors) {
    return errors.reduce(function (errs, err) { return errs.concat((err instanceof UnsubscriptionError_1.UnsubscriptionError) ? err.errors : err); }, []);
}


var Subscription_1 = {
	Subscription: Subscription_2
};

"use strict";
var empty = {
    closed: true,
    next: function (value) { },
    error: function (err) { throw err; },
    complete: function () { }
};


var Observer = {
	empty: empty
};

var rxSubscriber = createCommonjsModule(function (module, exports) {
"use strict";

var Symbol = root.root.Symbol;
exports.rxSubscriber = (typeof Symbol === 'function' && typeof Symbol.for === 'function') ?
    Symbol.for('rxSubscriber') : '@@rxSubscriber';
/**
 * @deprecated use rxSubscriber instead
 */
exports.$$rxSubscriber = exports.rxSubscriber;

});

"use strict";
var __extends$1 = (commonjsGlobal && commonjsGlobal.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};




/**
 * Implements the {@link Observer} interface and extends the
 * {@link Subscription} class. While the {@link Observer} is the public API for
 * consuming the values of an {@link Observable}, all Observers get converted to
 * a Subscriber, in order to provide Subscription-like capabilities such as
 * `unsubscribe`. Subscriber is a common type in RxJS, and crucial for
 * implementing operators, but it is rarely used as a public API.
 *
 * @class Subscriber<T>
 */
var Subscriber = (function (_super) {
    __extends$1(Subscriber, _super);
    /**
     * @param {Observer|function(value: T): void} [destinationOrNext] A partially
     * defined Observer or a `next` callback function.
     * @param {function(e: ?any): void} [error] The `error` callback of an
     * Observer.
     * @param {function(): void} [complete] The `complete` callback of an
     * Observer.
     */
    function Subscriber(destinationOrNext, error, complete) {
        _super.call(this);
        this.syncErrorValue = null;
        this.syncErrorThrown = false;
        this.syncErrorThrowable = false;
        this.isStopped = false;
        switch (arguments.length) {
            case 0:
                this.destination = Observer.empty;
                break;
            case 1:
                if (!destinationOrNext) {
                    this.destination = Observer.empty;
                    break;
                }
                if (typeof destinationOrNext === 'object') {
                    if (destinationOrNext instanceof Subscriber) {
                        this.destination = destinationOrNext;
                        this.destination.add(this);
                    }
                    else {
                        this.syncErrorThrowable = true;
                        this.destination = new SafeSubscriber(this, destinationOrNext);
                    }
                    break;
                }
            default:
                this.syncErrorThrowable = true;
                this.destination = new SafeSubscriber(this, destinationOrNext, error, complete);
                break;
        }
    }
    Subscriber.prototype[rxSubscriber.rxSubscriber] = function () { return this; };
    /**
     * A static factory for a Subscriber, given a (potentially partial) definition
     * of an Observer.
     * @param {function(x: ?T): void} [next] The `next` callback of an Observer.
     * @param {function(e: ?any): void} [error] The `error` callback of an
     * Observer.
     * @param {function(): void} [complete] The `complete` callback of an
     * Observer.
     * @return {Subscriber<T>} A Subscriber wrapping the (partially defined)
     * Observer represented by the given arguments.
     */
    Subscriber.create = function (next, error, complete) {
        var subscriber = new Subscriber(next, error, complete);
        subscriber.syncErrorThrowable = false;
        return subscriber;
    };
    /**
     * The {@link Observer} callback to receive notifications of type `next` from
     * the Observable, with a value. The Observable may call this method 0 or more
     * times.
     * @param {T} [value] The `next` value.
     * @return {void}
     */
    Subscriber.prototype.next = function (value) {
        if (!this.isStopped) {
            this._next(value);
        }
    };
    /**
     * The {@link Observer} callback to receive notifications of type `error` from
     * the Observable, with an attached {@link Error}. Notifies the Observer that
     * the Observable has experienced an error condition.
     * @param {any} [err] The `error` exception.
     * @return {void}
     */
    Subscriber.prototype.error = function (err) {
        if (!this.isStopped) {
            this.isStopped = true;
            this._error(err);
        }
    };
    /**
     * The {@link Observer} callback to receive a valueless notification of type
     * `complete` from the Observable. Notifies the Observer that the Observable
     * has finished sending push-based notifications.
     * @return {void}
     */
    Subscriber.prototype.complete = function () {
        if (!this.isStopped) {
            this.isStopped = true;
            this._complete();
        }
    };
    Subscriber.prototype.unsubscribe = function () {
        if (this.closed) {
            return;
        }
        this.isStopped = true;
        _super.prototype.unsubscribe.call(this);
    };
    Subscriber.prototype._next = function (value) {
        this.destination.next(value);
    };
    Subscriber.prototype._error = function (err) {
        this.destination.error(err);
        this.unsubscribe();
    };
    Subscriber.prototype._complete = function () {
        this.destination.complete();
        this.unsubscribe();
    };
    Subscriber.prototype._unsubscribeAndRecycle = function () {
        var _a = this, _parent = _a._parent, _parents = _a._parents;
        this._parent = null;
        this._parents = null;
        this.unsubscribe();
        this.closed = false;
        this.isStopped = false;
        this._parent = _parent;
        this._parents = _parents;
        return this;
    };
    return Subscriber;
}(Subscription_1.Subscription));
var Subscriber_2 = Subscriber;
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
var SafeSubscriber = (function (_super) {
    __extends$1(SafeSubscriber, _super);
    function SafeSubscriber(_parentSubscriber, observerOrNext, error, complete) {
        _super.call(this);
        this._parentSubscriber = _parentSubscriber;
        var next;
        var context = this;
        if (isFunction_1.isFunction(observerOrNext)) {
            next = observerOrNext;
        }
        else if (observerOrNext) {
            next = observerOrNext.next;
            error = observerOrNext.error;
            complete = observerOrNext.complete;
            if (observerOrNext !== Observer.empty) {
                context = Object.create(observerOrNext);
                if (isFunction_1.isFunction(context.unsubscribe)) {
                    this.add(context.unsubscribe.bind(context));
                }
                context.unsubscribe = this.unsubscribe.bind(this);
            }
        }
        this._context = context;
        this._next = next;
        this._error = error;
        this._complete = complete;
    }
    SafeSubscriber.prototype.next = function (value) {
        if (!this.isStopped && this._next) {
            var _parentSubscriber = this._parentSubscriber;
            if (!_parentSubscriber.syncErrorThrowable) {
                this.__tryOrUnsub(this._next, value);
            }
            else if (this.__tryOrSetError(_parentSubscriber, this._next, value)) {
                this.unsubscribe();
            }
        }
    };
    SafeSubscriber.prototype.error = function (err) {
        if (!this.isStopped) {
            var _parentSubscriber = this._parentSubscriber;
            if (this._error) {
                if (!_parentSubscriber.syncErrorThrowable) {
                    this.__tryOrUnsub(this._error, err);
                    this.unsubscribe();
                }
                else {
                    this.__tryOrSetError(_parentSubscriber, this._error, err);
                    this.unsubscribe();
                }
            }
            else if (!_parentSubscriber.syncErrorThrowable) {
                this.unsubscribe();
                throw err;
            }
            else {
                _parentSubscriber.syncErrorValue = err;
                _parentSubscriber.syncErrorThrown = true;
                this.unsubscribe();
            }
        }
    };
    SafeSubscriber.prototype.complete = function () {
        var _this = this;
        if (!this.isStopped) {
            var _parentSubscriber = this._parentSubscriber;
            if (this._complete) {
                var wrappedComplete = function () { return _this._complete.call(_this._context); };
                if (!_parentSubscriber.syncErrorThrowable) {
                    this.__tryOrUnsub(wrappedComplete);
                    this.unsubscribe();
                }
                else {
                    this.__tryOrSetError(_parentSubscriber, wrappedComplete);
                    this.unsubscribe();
                }
            }
            else {
                this.unsubscribe();
            }
        }
    };
    SafeSubscriber.prototype.__tryOrUnsub = function (fn, value) {
        try {
            fn.call(this._context, value);
        }
        catch (err) {
            this.unsubscribe();
            throw err;
        }
    };
    SafeSubscriber.prototype.__tryOrSetError = function (parent, fn, value) {
        try {
            fn.call(this._context, value);
        }
        catch (err) {
            parent.syncErrorValue = err;
            parent.syncErrorThrown = true;
            return true;
        }
        return false;
    };
    SafeSubscriber.prototype._unsubscribe = function () {
        var _parentSubscriber = this._parentSubscriber;
        this._context = null;
        this._parentSubscriber = null;
        _parentSubscriber.unsubscribe();
    };
    return SafeSubscriber;
}(Subscriber));


var Subscriber_1 = {
	Subscriber: Subscriber_2
};

"use strict";



function toSubscriber(nextOrObserver, error, complete) {
    if (nextOrObserver) {
        if (nextOrObserver instanceof Subscriber_1.Subscriber) {
            return nextOrObserver;
        }
        if (nextOrObserver[rxSubscriber.rxSubscriber]) {
            return nextOrObserver[rxSubscriber.rxSubscriber]();
        }
    }
    if (!nextOrObserver && !error && !complete) {
        return new Subscriber_1.Subscriber(Observer.empty);
    }
    return new Subscriber_1.Subscriber(nextOrObserver, error, complete);
}
var toSubscriber_2 = toSubscriber;


var toSubscriber_1 = {
	toSubscriber: toSubscriber_2
};

var observable = createCommonjsModule(function (module, exports) {
"use strict";

function getSymbolObservable(context) {
    var $$observable;
    var Symbol = context.Symbol;
    if (typeof Symbol === 'function') {
        if (Symbol.observable) {
            $$observable = Symbol.observable;
        }
        else {
            $$observable = Symbol('observable');
            Symbol.observable = $$observable;
        }
    }
    else {
        $$observable = '@@observable';
    }
    return $$observable;
}
exports.getSymbolObservable = getSymbolObservable;
exports.observable = getSymbolObservable(root.root);
/**
 * @deprecated use observable instead
 */
exports.$$observable = exports.observable;

});

"use strict";
/* tslint:disable:no-empty */
function noop() { }
var noop_2 = noop;


var noop_1 = {
	noop: noop_2
};

"use strict";

/* tslint:enable:max-line-length */
function pipe() {
    var fns = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        fns[_i - 0] = arguments[_i];
    }
    return pipeFromArray(fns);
}
var pipe_2 = pipe;
/* @internal */
function pipeFromArray(fns) {
    if (!fns) {
        return noop_1.noop;
    }
    if (fns.length === 1) {
        return fns[0];
    }
    return function piped(input) {
        return fns.reduce(function (prev, fn) { return fn(prev); }, input);
    };
}
var pipeFromArray_1 = pipeFromArray;


var pipe_1 = {
	pipe: pipe_2,
	pipeFromArray: pipeFromArray_1
};

"use strict";




/**
 * A representation of any set of values over any amount of time. This is the most basic building block
 * of RxJS.
 *
 * @class Observable<T>
 */
var Observable = (function () {
    /**
     * @constructor
     * @param {Function} subscribe the function that is called when the Observable is
     * initially subscribed to. This function is given a Subscriber, to which new values
     * can be `next`ed, or an `error` method can be called to raise an error, or
     * `complete` can be called to notify of a successful completion.
     */
    function Observable(subscribe) {
        this._isScalar = false;
        if (subscribe) {
            this._subscribe = subscribe;
        }
    }
    /**
     * Creates a new Observable, with this Observable as the source, and the passed
     * operator defined as the new observable's operator.
     * @method lift
     * @param {Operator} operator the operator defining the operation to take on the observable
     * @return {Observable} a new observable with the Operator applied
     */
    Observable.prototype.lift = function (operator) {
        var observable$$1 = new Observable();
        observable$$1.source = this;
        observable$$1.operator = operator;
        return observable$$1;
    };
    /**
     * Invokes an execution of an Observable and registers Observer handlers for notifications it will emit.
     *
     * <span class="informal">Use it when you have all these Observables, but still nothing is happening.</span>
     *
     * `subscribe` is not a regular operator, but a method that calls Observable's internal `subscribe` function. It
     * might be for example a function that you passed to a {@link create} static factory, but most of the time it is
     * a library implementation, which defines what and when will be emitted by an Observable. This means that calling
     * `subscribe` is actually the moment when Observable starts its work, not when it is created, as it is often
     * thought.
     *
     * Apart from starting the execution of an Observable, this method allows you to listen for values
     * that an Observable emits, as well as for when it completes or errors. You can achieve this in two
     * following ways.
     *
     * The first way is creating an object that implements {@link Observer} interface. It should have methods
     * defined by that interface, but note that it should be just a regular JavaScript object, which you can create
     * yourself in any way you want (ES6 class, classic function constructor, object literal etc.). In particular do
     * not attempt to use any RxJS implementation details to create Observers - you don't need them. Remember also
     * that your object does not have to implement all methods. If you find yourself creating a method that doesn't
     * do anything, you can simply omit it. Note however, that if `error` method is not provided, all errors will
     * be left uncaught.
     *
     * The second way is to give up on Observer object altogether and simply provide callback functions in place of its methods.
     * This means you can provide three functions as arguments to `subscribe`, where first function is equivalent
     * of a `next` method, second of an `error` method and third of a `complete` method. Just as in case of Observer,
     * if you do not need to listen for something, you can omit a function, preferably by passing `undefined` or `null`,
     * since `subscribe` recognizes these functions by where they were placed in function call. When it comes
     * to `error` function, just as before, if not provided, errors emitted by an Observable will be thrown.
     *
     * Whatever style of calling `subscribe` you use, in both cases it returns a Subscription object.
     * This object allows you to call `unsubscribe` on it, which in turn will stop work that an Observable does and will clean
     * up all resources that an Observable used. Note that cancelling a subscription will not call `complete` callback
     * provided to `subscribe` function, which is reserved for a regular completion signal that comes from an Observable.
     *
     * Remember that callbacks provided to `subscribe` are not guaranteed to be called asynchronously.
     * It is an Observable itself that decides when these functions will be called. For example {@link of}
     * by default emits all its values synchronously. Always check documentation for how given Observable
     * will behave when subscribed and if its default behavior can be modified with a {@link Scheduler}.
     *
     * @example <caption>Subscribe with an Observer</caption>
     * const sumObserver = {
     *   sum: 0,
     *   next(value) {
     *     console.log('Adding: ' + value);
     *     this.sum = this.sum + value;
     *   },
     *   error() { // We actually could just remove this method,
     *   },        // since we do not really care about errors right now.
     *   complete() {
     *     console.log('Sum equals: ' + this.sum);
     *   }
     * };
     *
     * Rx.Observable.of(1, 2, 3) // Synchronously emits 1, 2, 3 and then completes.
     * .subscribe(sumObserver);
     *
     * // Logs:
     * // "Adding: 1"
     * // "Adding: 2"
     * // "Adding: 3"
     * // "Sum equals: 6"
     *
     *
     * @example <caption>Subscribe with functions</caption>
     * let sum = 0;
     *
     * Rx.Observable.of(1, 2, 3)
     * .subscribe(
     *   function(value) {
     *     console.log('Adding: ' + value);
     *     sum = sum + value;
     *   },
     *   undefined,
     *   function() {
     *     console.log('Sum equals: ' + sum);
     *   }
     * );
     *
     * // Logs:
     * // "Adding: 1"
     * // "Adding: 2"
     * // "Adding: 3"
     * // "Sum equals: 6"
     *
     *
     * @example <caption>Cancel a subscription</caption>
     * const subscription = Rx.Observable.interval(1000).subscribe(
     *   num => console.log(num),
     *   undefined,
     *   () => console.log('completed!') // Will not be called, even
     * );                                // when cancelling subscription
     *
     *
     * setTimeout(() => {
     *   subscription.unsubscribe();
     *   console.log('unsubscribed!');
     * }, 2500);
     *
     * // Logs:
     * // 0 after 1s
     * // 1 after 2s
     * // "unsubscribed!" after 2.5s
     *
     *
     * @param {Observer|Function} observerOrNext (optional) Either an observer with methods to be called,
     *  or the first of three possible handlers, which is the handler for each value emitted from the subscribed
     *  Observable.
     * @param {Function} error (optional) A handler for a terminal event resulting from an error. If no error handler is provided,
     *  the error will be thrown as unhandled.
     * @param {Function} complete (optional) A handler for a terminal event resulting from successful completion.
     * @return {ISubscription} a subscription reference to the registered handlers
     * @method subscribe
     */
    Observable.prototype.subscribe = function (observerOrNext, error, complete) {
        var operator = this.operator;
        var sink = toSubscriber_1.toSubscriber(observerOrNext, error, complete);
        if (operator) {
            operator.call(sink, this.source);
        }
        else {
            sink.add(this.source ? this._subscribe(sink) : this._trySubscribe(sink));
        }
        if (sink.syncErrorThrowable) {
            sink.syncErrorThrowable = false;
            if (sink.syncErrorThrown) {
                throw sink.syncErrorValue;
            }
        }
        return sink;
    };
    Observable.prototype._trySubscribe = function (sink) {
        try {
            return this._subscribe(sink);
        }
        catch (err) {
            sink.syncErrorThrown = true;
            sink.syncErrorValue = err;
            sink.error(err);
        }
    };
    /**
     * @method forEach
     * @param {Function} next a handler for each value emitted by the observable
     * @param {PromiseConstructor} [PromiseCtor] a constructor function used to instantiate the Promise
     * @return {Promise} a promise that either resolves on observable completion or
     *  rejects with the handled error
     */
    Observable.prototype.forEach = function (next, PromiseCtor) {
        var _this = this;
        if (!PromiseCtor) {
            if (root.root.Rx && root.root.Rx.config && root.root.Rx.config.Promise) {
                PromiseCtor = root.root.Rx.config.Promise;
            }
            else if (root.root.Promise) {
                PromiseCtor = root.root.Promise;
            }
        }
        if (!PromiseCtor) {
            throw new Error('no Promise impl found');
        }
        return new PromiseCtor(function (resolve, reject) {
            // Must be declared in a separate statement to avoid a RefernceError when
            // accessing subscription below in the closure due to Temporal Dead Zone.
            var subscription;
            subscription = _this.subscribe(function (value) {
                if (subscription) {
                    // if there is a subscription, then we can surmise
                    // the next handling is asynchronous. Any errors thrown
                    // need to be rejected explicitly and unsubscribe must be
                    // called manually
                    try {
                        next(value);
                    }
                    catch (err) {
                        reject(err);
                        subscription.unsubscribe();
                    }
                }
                else {
                    // if there is NO subscription, then we're getting a nexted
                    // value synchronously during subscription. We can just call it.
                    // If it errors, Observable's `subscribe` will ensure the
                    // unsubscription logic is called, then synchronously rethrow the error.
                    // After that, Promise will trap the error and send it
                    // down the rejection path.
                    next(value);
                }
            }, reject, resolve);
        });
    };
    Observable.prototype._subscribe = function (subscriber) {
        return this.source.subscribe(subscriber);
    };
    /**
     * An interop point defined by the es7-observable spec https://github.com/zenparsing/es-observable
     * @method Symbol.observable
     * @return {Observable} this instance of the observable
     */
    Observable.prototype[observable.observable] = function () {
        return this;
    };
    /* tslint:enable:max-line-length */
    /**
     * Used to stitch together functional operators into a chain.
     * @method pipe
     * @return {Observable} the Observable result of all of the operators having
     * been called in the order they were passed in.
     *
     * @example
     *
     * import { map, filter, scan } from 'rxjs/operators';
     *
     * Rx.Observable.interval(1000)
     *   .pipe(
     *     filter(x => x % 2 === 0),
     *     map(x => x + x),
     *     scan((acc, x) => acc + x)
     *   )
     *   .subscribe(x => console.log(x))
     */
    Observable.prototype.pipe = function () {
        var operations = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            operations[_i - 0] = arguments[_i];
        }
        if (operations.length === 0) {
            return this;
        }
        return pipe_1.pipeFromArray(operations)(this);
    };
    /* tslint:enable:max-line-length */
    Observable.prototype.toPromise = function (PromiseCtor) {
        var _this = this;
        if (!PromiseCtor) {
            if (root.root.Rx && root.root.Rx.config && root.root.Rx.config.Promise) {
                PromiseCtor = root.root.Rx.config.Promise;
            }
            else if (root.root.Promise) {
                PromiseCtor = root.root.Promise;
            }
        }
        if (!PromiseCtor) {
            throw new Error('no Promise impl found');
        }
        return new PromiseCtor(function (resolve, reject) {
            var value;
            _this.subscribe(function (x) { return value = x; }, function (err) { return reject(err); }, function () { return resolve(value); });
        });
    };
    // HACK: Since TypeScript inherits static properties too, we have to
    // fight against TypeScript here so Subject can have a different static create signature
    /**
     * Creates a new cold Observable by calling the Observable constructor
     * @static true
     * @owner Observable
     * @method create
     * @param {Function} subscribe? the subscriber function to be passed to the Observable constructor
     * @return {Observable} a new cold observable
     */
    Observable.create = function (subscribe) {
        return new Observable(subscribe);
    };
    return Observable;
}());
var Observable_2 = Observable;

var Aes = require('decentjs-lib/lib').Aes;
var RIPEMD160 = require('ripemd160');
var CryptoUtils = /** @class */ (function () {
    function CryptoUtils() {
    }
    /**
       * Encrypts message with given private-pubic key pair
       *
       * @param {string} message
       * @param {string} privateKey
       * @param {string} publicKey
       * @param {string} [nonce]
       * @return {Buffer}
       */
    CryptoUtils.encryptWithChecksum = function (message, privateKey, publicKey, nonce) {
        if (nonce === void 0) { nonce = ''; }
        return Aes.encrypt_with_checksum(privateKey, publicKey, nonce, message);
    };
    CryptoUtils.ripemdHash = function (fromBuffer) {
        return new RIPEMD160().update(fromBuffer).digest('hex');
    };
    return CryptoUtils;
}());

var KeyAuth = /** @class */ (function () {
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
var Transaction = /** @class */ (function () {
    function Transaction(transaction) {
        this.m_from_account = transaction.m_from_account;
        this.m_to_account = transaction.m_to_account;
        this.m_operation_type = transaction.m_operation_type;
        this.m_transaction_amount = transaction.m_transaction_amount;
        this.m_transaction_fee = transaction.m_transaction_fee;
        this.m_str_description = transaction.m_str_description;
        this.m_timestamp = transaction.m_timestamp;
        this.m_memo = new TransactionMemo(transaction);
    }
    return Transaction;
}());
var TransactionMemo = /** @class */ (function () {
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
    return TransactionMemo;
}());
var AccountError = /** @class */ (function () {
    function AccountError() {
    }
    AccountError.account_does_not_exist = 'account_does_not_exist';
    AccountError.account_fetch_failed = 'account_fetch_failed';
    AccountError.transaction_history_fetch_failed = 'transaction_history_fetch_failed';
    AccountError.transfer_missing_pkey = 'transfer_missing_pkey';
    AccountError.transfer_sender_account_not_found = 'transfer_sender_account_not_found';
    AccountError.transfer_receiver_account_not_found = 'transfer_receiver_account_not_found';
    return AccountError;
}());
/**
 * API class provides wrapper for account information.
 */
var AccountApi = /** @class */ (function () {
    function AccountApi(dbApi, chainApi) {
        this._dbApi = dbApi;
        this._chainApi = chainApi;
    }
    /**
       * Gets chain account for given Account name.
       *
       * @param {string} name example: "u123456789abcdef123456789"
       * @return {Promise<Account>}
       */
    AccountApi.prototype.getAccountByName = function (name) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._dbApi
                .execute(DatabaseOperation.getAccountByName, [name])
                .then(function (account) {
                resolve(account);
            })
                .catch(function (err) {
                reject(AccountError.account_fetch_failed);
            });
        });
    };
    /**
       * Gets chain account for given Account id.
       *
       * @param {string} id example: "1.2.345"
       * @return {Promise<Account>}
       */
    AccountApi.prototype.getAccountById = function (id) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._dbApi
                .execute(DatabaseOperation.getAccounts, [[id]])
                .then(function (accounts) {
                if (accounts.length === 0) {
                    reject(AccountError.account_does_not_exist);
                }
                var account = accounts[0];
                resolve(account);
            })
                .catch(function (err) {
                reject(AccountError.account_fetch_failed);
            });
        });
    };
    /**
       * Gets transaction history for given Account name.
       *
       * @param {string} accountName example: "1.2.345"
       * @return {Promise<Transaction[]>}
       */
    AccountApi.prototype.getTransactionHistory = function (accountName) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.getAccountByName(accountName)
                .then(function (acc) {
                _this._dbApi
                    .execute(DatabaseOperation.searchAccountHistory, [
                    acc.id,
                    '-time',
                    '0.0.0',
                    100
                ])
                    .then(function (transactions) {
                    var res = transactions.map(function (tr) {
                        var transaction = new Transaction(tr);
                        // TODO: memo decrypt
                        transaction.m_from_account_name = new Observable_2(function (observable) {
                            _this.getAccountById(transaction.m_from_account)
                                .then(function (account) { return observable.next(account.name); })
                                .catch(function (err) { return observable.next(''); });
                        });
                        transaction.m_to_account_name = new Observable_2(function (observable) {
                            _this.getAccountById(transaction.m_to_account)
                                .then(function (account) { return observable.next(account.name); })
                                .catch(function (err) { return observable.next(''); });
                        });
                        return transaction;
                    });
                    resolve(res);
                })
                    .catch(function (err) {
                    reject(AccountError.transaction_history_fetch_failed);
                });
            })
                .catch(function (err) {
                reject(AccountError.transaction_history_fetch_failed);
            });
        });
    };
    /**
       * Transfers exact amount of DCT between accounts with optional
       * message for recipient
       *
       * @param {number} amount
       * @param {string} fromAccount Name or id of account
       * @param {string} toAccount Name or id of account
       * @param {string} [memo] Optional memo message for recipient, need to supply pKey to encrypt
       * @param {string} [privateKey] Optional private key, Mandatory if memo is set. Used to encrypt memo
       */
    AccountApi.prototype.transfer = function (amount, fromAccount, toAccount, memo, privateKey) {
        var _this = this;
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
                    reject(AccountError.transfer_sender_account_not_found);
                }
                if (!receiverAccount) {
                    reject(AccountError.transfer_receiver_account_not_found);
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
                var memo_object = {
                    from: fromPublicKey,
                    to: toPublicKey,
                    nonce: nonce,
                    message: CryptoUtils.encryptWithChecksum(memo, privateKey, toPublicKey, nonce)
                };
                var tr = TransactionOperator.createTransaction();
                var transfer = {
                    from: senderAccount.get('id'),
                    to: receiverAccount.get('id'),
                    amount: TransactionOperator.createAsset(amount, asset.get('id')),
                    memo: memo_object
                };
                TransactionOperator.addOperation({ name: TransactionOperationName.transfer, operation: transfer }, tr);
                TransactionOperator.broadcastTransaction(tr, privateKey, fromPublicKey)
                    .then(function () {
                    resolve();
                })
                    .catch(function () {
                    reject();
                });
            });
        });
    };
    /**
       * Current account balance of DCT asset on given account
       *
       * @param {string} account Account name or id
       * @return {Promise<number>}
       */
    AccountApi.prototype.getBalance = function (account) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var methods = new ChainMethods();
            methods.add(ChainMethods.getAccount, account);
            _this._chainApi
                .fetch(methods)
                .then(function (result) {
                var account = result[0];
                var accId = account.get('id');
                _this._dbApi
                    .execute(DatabaseOperation.getAccountBalances, [
                    accId,
                    [ChainApi.asset_id]
                ])
                    .then(function (res) {
                    resolve(res[0].amount);
                })
                    .catch(function (err) {
                    reject(err);
                });
            })
                .catch(function () {
                reject();
            });
        });
    };
    return AccountApi;
}());

var _a = require('decentjs-lib/lib/ws/cjs');
var Apis = _a.Apis;
var ChainConfig = _a.ChainConfig;
var ChainStore = require('decentjs-lib/lib').ChainStore;
var Core = /** @class */ (function () {
    function Core(config) {
        this._config = config;
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
        var core = new Core(config);
        core.setupChain(config.chain_id, chainConfigApi);
        core._database = DatabaseApi.create(config, api, ChainStore);
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

var Decent = /** @class */ (function () {
    function Decent() {
    }
    Object.defineProperty(Decent.prototype, "core", {
        get: function () {
            return this._core;
        },
        enumerable: true,
        configurable: true
    });
    Decent.instance = function () {
        return this._instance || (this._instance = new Decent());
    };
    Decent.prototype.initialize = function (config) {
        // TODO: check validity of config
        this._config = config;
        this._core = Core.create({
            decent_network_wspaths: config.decent_network_wspaths,
            chain_id: config.chain_id
        });
    };
    return Decent;
}());

var _a$3 = require('./../node_modules/decentjs-lib/lib/ecc');
var Utils = /** @class */ (function () {
    function Utils() {
    }
    Utils.ripemdHash = function (fromBuffer) {
        return CryptoUtils.ripemdHash(fromBuffer);
    };
    return Utils;
}());

export { Core, ContentApi, SearchParams, SearchParamsOrder, Decent, Utils };
//# sourceMappingURL=decent-js.es5.js.map
