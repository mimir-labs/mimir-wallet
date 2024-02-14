// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

const path = require('path');
const webpack = require('webpack');

function createWebpack(context, mode = 'production') {
  const pkgJson = require(path.join(context, 'package.json'));

  return {
    context,
    entry: ['./src/index.ts'],
    mode,
    module: {
      rules: [
        {
          include: /node_modules/,
          test: /\.mjs$/,
          type: 'javascript/auto'
        },
        {
          exclude: /(node_modules)/,
          test: /\.(js|mjs|ts|tsx)$/,
          use: [
            require.resolve('thread-loader'),
            {
              loader: require.resolve('babel-loader'),
              options: require('../babel.config')
            }
          ]
        }
      ]
    },
    node: {
      __dirname: false,
      __filename: false
    },
    optimization: {
      minimize: mode === 'production'
    },
    output: {
      filename: 'mimir-injectd.min.js',
      globalObject: "(typeof self !== 'undefined' ? self : this)",
      path: path.join(context, 'build'),
      publicPath: '/'
    },
    performance: {
      hints: false
    },
    resolve: {
      alias: {
        'react/jsx-runtime': require.resolve('react/jsx-runtime')
      },
      extensions: ['.js', '.jsx', '.mjs', '.ts', '.tsx'],
      fallback: {
        crypto: require.resolve('crypto-browserify'),
        path: require.resolve('path-browserify'),
        stream: require.resolve('stream-browserify')
      }
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.VERSION': JSON.stringify(pkgJson.version)
      })
    ]
  };
}

module.exports = createWebpack(__dirname);
