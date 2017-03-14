const webpack = require('webpack');
const path = require('path');
const Configuration = require('./webpack/config');
const configuration = new Configuration();

const prod = process.env.NODE_ENV === 'prod';

const webpackConfiguration = {
    context: __dirname,
    devtool: 'source-map-loader',
    resolve: {
        extensions: [
            '.ts',
            '.tsx',
            '.js'
        ]
    },
    entry: {
        main: ['babel-polyfill', './index.tsx'],
        vendor: ['redux', 'react-redux']
    },
    output: {
        path: path.join(prod ? 'dist' : 'build'),
        filename: '[name].bundle.js',
        chunkFilename: '[name].chunk.js'
    },
    target: 'web',
    module: {
        rules: configuration.getRules()
    },
    externals: {
        'react': 'React',
        'react-dom': 'ReactDOM'
    }
};

let plugins = [
    new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor'
    })
];

if (prod) {
    plugins = [
        ...plugins,
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.optimize.UglifyJsPlugin({
            debug: false,
            minimize: true,
            sourceMap: false,
            output: {
                comments: false
            },
            compressor: {
                warnings: false
            },
            mangle: false
        })
    ];
}

webpackConfiguration.plugins = plugins;

if (configuration.isFilenameResolved()) {
    webpackConfiguration.node = {
        __filename: true,
        __dirname: true
    };
}

module.exports = webpackConfiguration;