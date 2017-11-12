function commonjsRequire () {
	throw new Error('Dynamic requires are not currently supported by rollup-plugin-commonjs');
}

function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var decentJs = createCommonjsModule(function (module, exports) {
(function (factory) {
    {
        var v = factory(commonjsRequire, exports);
        if (v !== undefined) module.exports = v;
    }
})(function (require, exports) {
    "use strict";
    function __export(m) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    var decent_1 = require("./decent");
    exports.Decent = decent_1.Decent;
    var utils_1 = require("./utils");
    exports.Utils = utils_1.Utils;
    __export(require("./publicApi"));
});

});

var decentJs$1 = unwrapExports(decentJs);

export default decentJs$1;
//# sourceMappingURL=decent-js.es5.js.map
