const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const parseEnvKeys = (env) => {
  const currentPath = path.join(__dirname);
  const basePath = `${currentPath}/env/.env`;
  const envPath = `${basePath}.${env.ENVIRONMENT}`;
  const finalPath = fs.existsSync(envPath) ? envPath : basePath;
  const fileEnv = dotenv.config({
    path: finalPath
  }).parsed;

  return Object.keys(fileEnv).reduce((keys, key) => {
    keys[`process.env.${key}`] = JSON.stringify(fileEnv[key]);
    return keys;
  }, {});
};

module.exports = (env) => {
  const envKeys = parseEnvKeys(env);

  return {
    resolve: {
      extensions: ['.js', '.ts'],
      alias: {
        '@components': path.resolve(__dirname, 'src/components'),
        '@style': path.resolve(__dirname, 'src/common/style'),
        '@util': path.resolve(__dirname, 'src/common/util'),
        '@types': path.resolve(__dirname, 'src/common/types'),
        '@store': path.resolve(__dirname, 'src/store'),
        '@model': path.resolve(__dirname, 'src/model'),
        '@controllers': path.resolve(__dirname, 'src/controllers')
      }
    },
    entry: {
      index: './src/index'
    },
    module: {
      rules: [
        {
          test: /\.(js|ts)/,
          loader: 'babel-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.scss$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
        },
        {
          test: /\.(png|jpe?g|gif)$/i,
          use: {
            loader: 'url-loader',
            options: {
              publicPath: '/',
              name: '[name].[ext]?[hash]',
              limit: 10000
            }
          }
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html',
        filename: 'index.html',
        chunks: ['index'],
        hash: true
      }),
      new CleanWebpackPlugin(),
      new webpack.DefinePlugin(envKeys),
      new MiniCssExtractPlugin({
        filename: '[name].css'
      })
    ],
    output: {
      path: path.join(__dirname, '../backend/public'),
      publicPath: '/',
      filename: '[name].js'
    }
  };
};
