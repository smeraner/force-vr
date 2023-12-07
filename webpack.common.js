const path = require('path');
const fs = require('fs');
const webpack = require('webpack');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const artifact = require('./package.json');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const StylelintPlugin = require('stylelint-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

const fileName = `${artifact.name}-${artifact.version.slice(0, 3)}`;

module.exports = (env, argv) => ({
    entry: {
        [fileName]: './src/index.js',
    },
    output: {
        filename: '[name].[fullhash].bundle.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/',
    },
    devServer: {
        historyApiFallback: true,
        open: true,
        compress: true,
        port: 8080,
        http2: true,
        https: {
          key: fs.readFileSync('./server.pem'),
          cert: fs.readFileSync('./server.pem'),
        },
    },
    module: {
        rules: [
            {
                test: /\.(scss|css)$/,
                use: [
                    { loader: 'style-loader' },
                    { loader: 'css-loader', options: { sourceMap: true, importLoaders: 1 } },
                    // { loader: 'postcss-loader', options: { sourceMap: true } },
                ],
            },
            // {
            //     test: /\.js$/,
            //     exclude: /(node_modules)/,
            //     use: ['babel-loader'],
            // },
            {
                test: /\.(?:ico|gif|png|jpg|jpeg|webp|svg|stl|glb|ogg)$/i,
                loader: 'file-loader',
                options: {
                    name: '[path][name].[ext]',
                    context: 'src', // prevent display of src/ in filename
                },
            },
            {
                test: /\.(woff(2)?|eot|ttf|otf|)$/,
                loader: 'url-loader',
                options: {
                    limit: 8192,
                    name: '[path][name].[ext]',
                    context: 'src', // prevent display of src/ in filename
                },
            },
        ],
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        // new ESLintPlugin(),
        new CopyWebpackPlugin({
            patterns: [
                { from: './models', to: 'models' },
                { from: './sounds', to: 'sounds' },
                { from: './textures', to: 'textures' }
            ],
        }),
        new HtmlWebpackPlugin({
            title: 'Three.js Webpack Boilerplate',
            //favicon: path.resolve(__dirname, 'public/favicon.png'),
            template: path.resolve(__dirname, 'src/index.html'), // template file
            filename: 'index.html', // output file
            publicPath: './',
        }),
        new StylelintPlugin({ configFile: './.stylelintrc.json', context: 'src', files: '**/*.scss' }),
    ],
    devtool: 'eval-source-map',
    performance: {
        hints: false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000,
    },
});