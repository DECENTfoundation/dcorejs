const path = require('path');

module.exports = {
    entry: './lib/dcore-js.js',
    output: {
        filename: 'dcore-js.umd.js',
        path: path.resolve(__dirname, 'dist'),
        libraryTarget: "umd",
        library: "dcore-js",
    },
    devtool: 'source-map'
};
