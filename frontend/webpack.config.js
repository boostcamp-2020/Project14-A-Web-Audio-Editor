const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./webpack.config.common.js');

module.exports = (env) =>
  merge(common(env), {
    mode: 'development',
    devtool: 'eval',
    devServer: {
      contentBase: path.join(__dirname, 'dist'),
      inline: true,
      hot: true,
      host: 'localhost',
      port: 5500,
      historyApiFallback: true
    }
  });
