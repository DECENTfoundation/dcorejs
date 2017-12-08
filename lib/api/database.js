var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var BBPromise = require('bluebird');
var ConnectionStatus = (function () {
    function ConnectionStatus() {
    }
    ConnectionStatus.open = 'open';
    return ConnectionStatus;
}());
export { ConnectionStatus };
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
export { SearchParamsOrder };
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
export { SearchAccountHistoryOrder };
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
export { SearchParams };
var DatabaseError = (function () {
    function DatabaseError() {
    }
    DatabaseError.chain_connection_failed = 'chain_connection_failed';
    DatabaseError.chain_connecting = 'chain_connecting';
    DatabaseError.database_execution_failed = 'database_execution_failed';
    return DatabaseError;
}());
export { DatabaseError };
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
export { DatabaseOperation };
export var DatabaseOperations;
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
export { Database };
var DatabaseApi = (function (_super) {
    __extends(DatabaseApi, _super);
    function DatabaseApi(config, api) {
        var _this = _super.call(this) || this;
        _this._api = api;
        _this._config = config;
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
    DatabaseApi.prototype.initApi = function () {
        var _this = this;
        this._api.setRpcConnectionStatusCallback(function (status) {
            _this._connectionStatus = status;
        });
        var promises = [];
        this._config.decent_network_wspaths.forEach(function (address) {
            promises.push(_this.getConnectionPromise(address, _this._api));
        });
        this._apiConnector = BBPromise.any(promises);
        return this._apiConnector;
    };
    DatabaseApi.prototype.getConnectionPromise = function (forAddress, toApi) {
        return toApi.instance(forAddress, true).init_promise;
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
export { DatabaseApi };
//# sourceMappingURL=database.js.map