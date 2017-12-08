import { ContentApi } from './content';
import { DatabaseApi } from './api/database';
import { ChainApi } from './api/chain';
import { AccountApi } from './account';
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
    Core.create = function (config, api, chainConfigApi, chainStore) {
        var core = new Core();
        core.setupChain(config.chain_id, chainConfigApi);
        core._database = DatabaseApi.create(config, api);
        var apiConnectionPromise = core._database.initApi();
        core._chain = new ChainApi(apiConnectionPromise, chainStore);
        core._content = new ContentApi(core._database, core._chain);
        core._account = new AccountApi(core._database, core._chain);
        return core;
    };
    Core.prototype.setupChain = function (chainId, chainConfig) {
        ChainApi.setupChain(chainId, chainConfig);
    };
    return Core;
}());
export { Core };
//# sourceMappingURL=core.js.map