"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DecentLib = require("decentjs-lib");
var ChainError = (function () {
    function ChainError() {
    }
    ChainError.command_execution_failed = 'command_execution_failed';
    return ChainError;
}());
exports.ChainError = ChainError;
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
exports.ChainMethods = ChainMethods;
var ChainApi = (function () {
    function ChainApi(apiConnector) {
        this._apiConnector = apiConnector;
    }
    ChainApi.generateNonce = function () {
        return DecentLib.TransactionHelper.unique_nonce_uint64();
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
                DecentLib.ChainStore.init().then(function () {
                    var commands = methods.commands
                        .map(function (op) { return DecentLib.FetchChain(op.name, op.param); });
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
exports.ChainApi = ChainApi;
//# sourceMappingURL=chain.js.map