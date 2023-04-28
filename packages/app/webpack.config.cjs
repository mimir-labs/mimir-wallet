// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const { merge } = require('webpack-merge');
const { InjectManifest } = require('workbox-webpack-plugin');

const baseConfig = require('./webpack.base.cjs');

const context = __dirname;

module.exports = merge(baseConfig(context), {
  devtool: process.env.BUILD_ANALYZE ? 'source-map' : false,
  plugins: [
    new HtmlWebpackPlugin({
      title: 'mimir-wallet',
      inject: true,
      template: path.join(context, 'src/index.html')
    }),
    new InjectManifest({
      swSrc: './src/serviceWorker/index.ts',
      swDest: 'service-worker.js'
    })
  ]
});
