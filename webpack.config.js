const PerspectivePlugin = require("@finos/perspective-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const path = require('path');


const webappConfig = {
    //entry: './src/index.js',
    mode: 'development',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
        clean: {
            keep: /modules/
        }
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
    },
    plugins: [
        new HtmlWebpackPlugin(),
        new PerspectivePlugin(),
        new CopyPlugin({
            patterns: [
                {
                    from: "**",
                    globOptions: {
                        ignore: ["**/modules/**"]
                    },
                    to: "",
                    context: "static"
                }
            ]
        }),
    ],
    module: {
        rules: [
            {
                test: /\.css$/,
                exclude: [/monaco-editor/],
                use: [
                    { loader: "style-loader" },
                    { loader: "css-loader" }
                ],
            },
        ],
    }
};

const sjsConfig = {
    context: path.resolve(__dirname, 'static/modules'),
    entry: {
        'test_fn': '/test_fn.js',
        'verify_manifest': '/verify_manifest.js'
    },
    output: {
        iife: false,
        filename: '[name].sjs',
        path: path.resolve(__dirname, 'dist/modules'),
        clean: true
    },
    resolve: {
        extensions: ['.sjs', '.js', '.json', '.wasm'],
    },
}

module.exports = [webappConfig, sjsConfig]
//module.exports = [webappConfig]