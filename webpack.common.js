const path = require('path');
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const RemovePlugin = require('remove-files-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: {
    "popup": './src/assets/js/boot-popup.mjs',
    "options": './src/assets/js/boot-options.mjs',
  },

  module: {
    rules: [
      {
        test: /.(js|jsx|mjs)$/,
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
    new HtmlWebpackPlugin({
      filename: 'options.html',
      template: './src/options.html',
      chunks: ['options']
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
    alias: {
      '@/options.mjs': path.resolve(__dirname, 'src/assets/js/options.mjs'),
      '@/popup.mjs': path.resolve(__dirname, 'src/assets/js/popup.mjs'),
      '@/store.js': path.resolve(__dirname, 'src/assets/js/store.js'),
      '@/main.mjs': path.resolve(__dirname, 'src/assets/js/main.mjs'),
      '@/components': path.resolve(__dirname, 'src/assets/js/components'),
      '@/features': path.resolve(__dirname, 'src/assets/js/features'),
      '@/scss': path.resolve(__dirname, 'src/assets/scss'),
      '@/vendor': path.resolve(__dirname, 'src/lib/vendor'),
    },
  },

  watchOptions: {
    ignored: /node_modules/,
  },

  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist')
  }
};
