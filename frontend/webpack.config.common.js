const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env) => {

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
        '@controllers': path.resolve(__dirname, 'src/controllers'),
        '@command': path.resolve(__dirname, 'src/common/command'),
        '@audio': path.resolve(__dirname, 'src/common/audio'),
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
        favicon: './public/favicon.ico',
        hash: true
      }),
      new CleanWebpackPlugin(),
      new MiniCssExtractPlugin({
        filename: '[name].css'
      })
    ],
    output: {
      path: path.join(__dirname, './dist'),
      publicPath: '/',
      filename: '[name].js'
    }
  };
};
