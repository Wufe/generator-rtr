'use strict';

const fs = require('fs');
const path = require('path');

const typescriptRule = {
    test: /\.tsx?$/,
    exclude: /(node_modules)/,
    use: [{
        loader: 'awesome-typescript-loader'
    }]
};

const sassRule = {
    test: /\.s(c|a)ss$/,
    use: [
        { loader: 'style-loader' },
        { loader: 'css-loader' },
        { loader: 'sass-loader' }
    ]
};

const jsonRule = {
    test: /\.json$/,
    use: [{
        loader: 'json-loader'
    }]
};

const babelRule = {
    test: /\.tsx?$/,
    use: [{
            loader: 'babel-loader',
            options: {
                presets: [
                    'es2015',
                    'stage-0'
                ],
                plugins: [
                    'syntax-dynamic-import'
                ]
            }
        },
        { loader: 'awesome-typescript-loader' }
    ]
};

class WebpackConfig {

    constructor() {
        this.configuration = JSON.parse(
            fs.readFileSync(
                path.resolve(
                    path.join(
                        __dirname,
                        'config.json'
                    )
                )
            )
        );
    }

    getRules() {
        const { loaders } = this.configuration;
        return [
            loaders.babel ? babelRule : typescriptRule,
            ...(loaders.sass ? [sassRule] : []),
            ...(loaders.json ? [jsonRule] : [])
        ];
    }

    getLoaders() {
        return this.loaders;
    }

    isFilenameResolved() {
        if (this.configuration["dirname-filename"])
            return true;
        return false;
    }
}

module.exports = WebpackConfig;