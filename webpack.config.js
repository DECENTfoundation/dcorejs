const path = require('path');

module.exports = {
    entry: './lib/dcorejs.js',
    output: {
        filename: 'dcorejs.umd.js',
        path: path.resolve(__dirname, 'dist'),
        libraryTarget: "umd",
        library: "dcorejs",
    },
    devtool: 'source-map'
};
