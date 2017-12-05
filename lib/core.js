"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var content_1 = require("./content");
var database_1 = require("./api/database");
var chain_1 = require("./api/chain");
var account_1 = require("./account");
var DecentLib = require("decentjs-lib");
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
        if (api === void 0) { api = DecentLib.Apis; }
        if (chainConfigApi === void 0) { chainConfigApi = DecentLib.ChainConfig; }
        var core = new Core();
        core.setupChain(config.chain_id, chainConfigApi);
        core._database = database_1.DatabaseApi.create(config, api);
        var apiConnectionPromise = core._database.initApi(config.decent_network_wspaths, api);
        core._chain = new chain_1.ChainApi(apiConnectionPromise);
        core._content = new content_1.ContentApi(core._database, core._chain);
        core._account = new account_1.AccountApi(core._database, core._chain);
        return core;
    };
    Core.prototype.setupChain = function (chainId, chainConfig) {
        chain_1.ChainApi.setupChain(chainId, chainConfig);
    };
    return Core;
}());
exports.Core = Core;
//# sourceMappingURL=core.js.map