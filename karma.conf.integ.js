// Karma configuration
// Generated on Wed Jan 24 2018 14:02:51 GMT+0100 (CET)

module.exports = function (config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: './',


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['mocha', 'chai', 'sinon'],


        // list of files / patterns to load in the browser
        files: [
            './dist/dcorejs.umd.js',
            './node_modules/mocha/mocha.js',
            'src/test/client/declarations.js',
            'src/test/client/sinonDeclarations.js',
            'src/test/client/integration/fixtures/accounts.js',
            'src/test/client/integration/fixtures/assets.js',
            'src/test/client/integration/fixtures/content.js',
            'src/test/client/integration/fixtures/keys.js',
            'src/test/client/integration/fixtures/seeders.js',
            'src/test/client/integration/*.test.js',
            './test-main.js'
        ],


        // list of files / patterns to exclude
        exclude: [
            './node_modules'
        ],


        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress'],


        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,


        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['Chrome'],


        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity,

        client: {
            config: {
                browserConsoleLogOptions: true
            }
        }
    })
};
