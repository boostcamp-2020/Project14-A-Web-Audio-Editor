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
        '@util': path.resolve(__dirname, 'src/common/util')
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
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  modules: false,
                  targets: {
                    browsers: ['> 1% in KR']
                  }
                }
              ],
              ['@babel/preset-typescript']
            ],
            plugins: ['@babel/plugin-transform-runtime','@babel/plugin-proposal-class-properties', '@babel/proposal-object-rest-spread']
          }
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
