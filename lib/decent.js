import { setLibRef } from './helpers';
import { Core } from './core';
var DecentError = (function () {
    function DecentError() {
    }
    DecentError.app_not_initialized = 'app_not_initialized';
    DecentError.app_missing_config = 'app_missing_config';
    return DecentError;
}());
export { DecentError };
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
    Decent.initialize = function (config, decentjs_lib) {
        this._decentjs_lib = decentjs_lib;
        setLibRef(decentjs_lib);
        if (config.decent_network_wspaths[0] === '' || config.chain_id === '') {
            throw new Error(DecentError.app_missing_config);
        }
        if (Decent._core) {
            return;
        }
        Decent._core = Core.create({
            decent_network_wspaths: config.decent_network_wspaths,
            chain_id: config.chain_id
        }, this._decentjs_lib.Apis, this._decentjs_lib.ChainConfig, this._decentjs_lib.ChainStore);
    };
    return Decent;
}());
export { Decent };
//# sourceMappingURL=decent.js.map