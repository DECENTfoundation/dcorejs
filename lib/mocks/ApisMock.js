var mockUser = {
    id: '1.2.473',
    registrar: '1.2.15',
    name: 'u6bbca9e1c60e1a132e3dc6fb2ba2ebe3',
    owner: {
        weight_threshold: 1,
        account_auths: [],
        key_auths: [['DCT7cRR2sA3QFWujqXdiEUvhpX2DZNQ4dK3WrNskTh38CGrKJtEWg', 1]]
    },
    active: {
        weight_threshold: 1,
        account_auths: [],
        key_auths: [['DCT7cRR2sA3QFWujqXdiEUvhpX2DZNQ4dK3WrNskTh38CGrKJtEWg', 1]]
    },
    options: {
        memo_key: 'DCT7cRR2sA3QFWujqXdiEUvhpX2DZNQ4dK3WrNskTh38CGrKJtEWg',
        voting_account: '1.2.3',
        num_miner: 0,
        votes: [],
        extensions: [],
        allow_subscription: false,
        price_per_subscribe: {
            amount: 0,
            asset_id: '1.3.0'
        },
        subscription_period: 0
    },
    rights_to_publish: {
        is_publishing_manager: false,
        publishing_rights_received: [],
        publishing_rights_forwarded: []
    },
    statistics: '2.5.473',
    top_n_control_flags: 0
};
var ApisMock = (function () {
    function ApisMock(toFail) {
        if (toFail === void 0) { toFail = false; }
        this._toFail = toFail;
    }
    ApisMock.exec = function (operation, parameters) {
        return new Promise(function (resolve, reject) {
        });
    };
    ApisMock.getAccountByName = function (name) {
        return mockUser.name === name ? mockUser.name : null;
    };
    ApisMock.instance = function (address) {
        var inst = new ApisMock();
        inst._address = address;
        return inst;
    };
    ApisMock.prototype.init_promise = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._toFail ? reject('') : resolve();
        });
    };
    return ApisMock;
}());
export { ApisMock };
//# sourceMappingURL=ApisMock.js.map