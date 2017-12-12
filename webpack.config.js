const path = require('path');

module.exports = {
    entry: './lib/decent-js.js',
    output: {
        filename: 'decent-js.umd.js',
        path: path.resolve(__dirname, 'dist'),
        libraryTarget: "umd",
        library: "decent",
    },
    devtool: 'source-map'
};