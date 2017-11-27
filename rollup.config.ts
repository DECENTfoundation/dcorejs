import resolve from 'rollup-plugin-node-resolve';
import sourceMaps from 'rollup-plugin-sourcemaps';
import camelCase from 'lodash.camelcase';
import globals from 'rollup-plugin-node-globals';
// import json from 'rollup-plugin-json';

const pkg = require('./package.json');

const libraryName = 'decent-js';

export default {
    input: `compiled/${libraryName}.js`,
    output: [
        {file: pkg.main, name: camelCase(libraryName), format: 'umd'},
        {file: pkg.module, format: 'es'},
    ],
    sourcemap: true,
    // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
    external: ['decentjs-lib'],
    watch: {
        include: 'compiled/**',
    },
    globals: {
        'decentjs-lib': 'decentjs-lib'
    },
    plugins: [
        // Allow node_modules resolution, so you can use 'external' to control
        // which external modules to include in the bundle
        // https://github.com/rollup/rollup-plugin-node-resolve#usage
        resolve({
            // modulesOnly: true,
            customResolveOptions: {
                moduleDirectory: 'node_modules'
            }
        }),

        // Resolve source maps to the original source
        sourceMaps(),
    ],
};
