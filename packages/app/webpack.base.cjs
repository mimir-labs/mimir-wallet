// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

const fs = require('fs');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');
const babel = require('@mimirdev/dev/config/babel-config-webpack.cjs');

const findPackages = require('../../scripts/findPackages.cjs');

function createWebpack(context, mode = 'production') {
  const pkgJson = require(path.join(context, 'package.json'));
  const alias = findPackages().reduce((alias, { dir, name }) => {
    alias[name] = path.resolve(context, `../${dir}/src`);

    return alias;
  }, {});
  const plugins = fs.existsSync(path.join(context, 'public')) ? new CopyWebpackPlugin({ patterns: [{ from: 'public' }] }) : [];

  return {
    target: 'web',
    context,
    entry: './src/index.tsx',
    mode,
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, require.resolve('css-loader')]
        },
        {
          test: /\.less/,
          use: [
            MiniCssExtractPlugin.loader,
            require.resolve('css-loader'),
            {
              loader: require.resolve('less-loader'),
              options: {
                lessOptions: {
                  modifyVars: {},
                  javascriptEnabled: true
                }
              }
            }
          ]
        },
        {
          exclude: /(node_modules)/,
          test: /\.(js|mjs|ts|tsx)$/,
          use: [
            require.resolve('thread-loader'),
            {
              loader: require.resolve('babel-loader'),
              options: babel
            }
          ]
        },
        {
          test: /\.md$/,
          use: [require.resolve('html-loader'), require.resolve('markdown-loader')]
        },
        {
          test: /\.svg$/,
          use: ['@svgr/webpack']
        },
        {
          test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/, /\.webp$/],
          type: 'asset',
          generator: {
            filename: 'static/[name].[ext]'
          },
          parser: {
            dataUrlCondition: {
              maxSize: 10000
            }
          }
        },
        {
          test: [/\.eot$/, /\.ttf$/, /\.woff$/, /\.woff2$/],
          use: [
            {
              loader: require.resolve('file-loader'),
              options: {
                esModule: false,
                name: 'static/[name].[contenthash:8].[ext]'
              }
            }
          ]
        }
      ]
    },
    node: {
      __dirname: true,
      __filename: false
    },
    optimization: {
      chunkIds: 'deterministic',
      concatenateModules: true,
      minimize: mode === 'production',
      moduleIds: 'deterministic',
      runtimeChunk: 'single',
      splitChunks: {
        cacheGroups: [
          ['app', /[\\/]packages[\\/]app.*[\\/]src[\\/]/],
          ['comm', /[\\/]packages[\\/]react-.*[\\/]src[\\/]/],
          ['page', /[\\/]packages[\\/]page-.*[\\/]src[\\/]/],
          ['modu', /[\\/]node_modules[\\/]/]
        ].reduce(
          (result, [name, test], index) => ({
            ...result,
            [`cacheGroup${index}`]: {
              chunks: 'initial',
              enforce: true,
              maxSize: 500_000,
              minSize: 0,
              name,
              priority: -1 * index,
              test
            }
          }),
          {}
        )
      }
    },
    output: {
      // this is for dynamic imports
      chunkFilename: 'dyna.[contenthash].js',
      // this is via splitChunks
      filename: ({ chunk: { name } }) => (['main', 'runtime'].includes(name) ? `${name === 'main' ? 'main' : 'load'}.[contenthash].js` : `${name.split('-')[0]}.[contenthash].js`),
      globalObject: "(typeof self !== 'undefined' ? self : this)",
      hashFunction: 'xxhash64',
      path: path.join(context, 'build'),
      publicPath: ''
    },
    performance: {
      hints: false
    },
    plugins: [
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: 'process/browser.js'
      }),
      new webpack.IgnorePlugin({
        contextRegExp: /moment$/,
        resourceRegExp: /^\.\/locale$/
      }),
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify(mode),
          VERSION: JSON.stringify(pkgJson.version)
        }
      }),
      new webpack.optimize.SplitChunksPlugin(),
      new MiniCssExtractPlugin({
        filename: '[name].[contenthash:8].css'
      })
    ].concat(plugins),
    resolve: {
      alias: {
        ...alias,
        'react/jsx-runtime': require.resolve('react/jsx-runtime')
      },
      extensions: ['.js', '.jsx', '.mjs', '.ts', '.tsx'],
      fallback: {
        assert: require.resolve('assert/'),
        crypto: require.resolve('crypto-browserify'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        os: require.resolve('os-browserify/browser'),
        path: require.resolve('path-browserify'),
        stream: require.resolve('stream-browserify'),
        url: require.resolve('url/')
      }
    }
  };
}

module.exports = createWebpack;
