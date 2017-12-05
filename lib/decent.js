"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("./core");
var DecentError = (function () {
    function DecentError() {
    }
    DecentError.app_not_initialized = 'app_not_initialized';
    DecentError.app_missing_config = 'app_missing_config';
    return DecentError;
}());
exports.DecentError = DecentError;
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
        Decent._core = core_1.Core.create({
            decent_network_wspaths: config.decent_network_wspaths,
            chain_id: config.chain_id
        });
    };
    return Decent;
}());
exports.Decent = Decent;
//# sourceMappingURL=decent.js.map