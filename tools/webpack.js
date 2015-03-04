var webpack = require('webpack');

// debug build
webpack({
    entry: "./build/tsuikyo.js",
    plugins: [
    ],
    output: {
        path: "./dist",
        filename: "tsuikyo.js"
    },
    module: {
    },
    //devtool: "source-map"
}).run(function(err, stats){if(err){console.error(err)}});

// release build
webpack({
    entry: "./build/tsuikyo.js",
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: true
            }
        }),
    ],
    output: {
        path: "./dist",
        filename: "tsuikyo.min.js"
    },
    module: {
    },
    // devtool: "source-map"
}).run(function(err, stats){if(err){console.error(err)}});

// library build
webpack({
    entry: "./build/tsuikyo.js",
    plugins: [
    ],
    output: {
        path: "./dist",
        filename: "tsuikyo.script.js",
        // export itself to a global var
        libraryTarget: "var",
        // name of the global var: "Foo"
        library: "Tsuikyo"
    },
    module: {
    },
    // devtool: "source-map"
}).run(function(err, stats){if(err){console.error(err)}});
