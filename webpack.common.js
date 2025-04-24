const path = require('path');
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const RemovePlugin = require('remove-files-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');
const { getWebpackAliases } = require('./alias.config');

module.exports = {
  entry: {
    'popup': './src/assets/ts/index.tsx',
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: [/node_modules/, /src\/test/],
      },
      {
        test: /\.(js|jsx|mjs)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react'
            ]
          }
        }
      },
      {
        test: /\.s?css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader',
        ]
      }
    ]
  },

  plugins: [
    new webpack.ProvidePlugin({
      React: 'react',
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "src/manifest.json",
        }
      ],
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "src/assets/images/screenly-logo*",
          to: "assets/images/[name][ext]",
        },
      ],
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "src/lib/vendor/browser-polyfill.min.js",
          to: "lib/vendor/[name][ext]",
        },
      ],
    }),
    new HtmlWebpackPlugin({
      filename: 'popup.html',
      template: './src/popup.html',
      chunks: ['popup']
    }),

    new MiniCssExtractPlugin(),

    new RemovePlugin({
      before: {
        include: ['dist']
      },
      after: {

      }
    })
  ],

  resolve: {
    alias: getWebpackAliases(),
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs'],
  },

  watchOptions: {
    ignored: /node_modules/,
  },

  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist')
  }
};
