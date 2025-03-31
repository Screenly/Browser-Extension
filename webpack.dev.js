const {merge} = require('webpack-merge');
const common = require('./webpack.common.js');

const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = merge(common, {
  devtool: 'source-map',
  mode: 'development',

  entry: {
    "tests": './src/test/spec/all.js',
  },
});
