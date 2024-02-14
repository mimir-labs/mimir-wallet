// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CracoConfig } from '@craco/types';
import { resolve } from 'path';
import * as webpack from 'webpack';
import { InjectManifest } from 'workbox-webpack-plugin';

const isProduction = process.env.NODE_ENV === 'production';

export default {
  webpack: {
    alias: {
      '@mimir-wallet': resolve(__dirname, 'src'),
      '@mimirdev/inject': '@mimirdev/inject/src'
    },
    configure: (config) => {
      // Configure webpack optimization:
      config.optimization = Object.assign(
        config.optimization || {},
        isProduction
          ? {
              splitChunks: {
                // Cap the chunk size to 5MB.
                // react-scripts suggests a chunk size under 1MB after gzip, but we can only measure maxSize before gzip.
                // react-scripts also caps cacheable chunks at 5MB, which gzips to below 1MB, so we cap chunk size there.
                // See https://github.com/facebook/create-react-app/blob/d960b9e/packages/react-scripts/config/webpack.config.js#L713-L716.
                maxSize: 5 * 1024 * 1024,
                // Optimize over all chunks, instead of async chunks (the default), so that initial chunks are also optimized.
                chunks: 'all'
              }
            }
          : {}
      );

      return {
        ...config,
        resolve: {
          ...config.resolve,
          fallback: {
            ...config.resolve?.fallback,
            crypto: 'crypto-browserify',
            stream: 'stream-browserify',
            Buffer: 'buffer'
          }
        }
      };
    },
    plugins: {
      add: [
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer']
        }) as any
      ].concat(
        isProduction
          ? [
              new InjectManifest({
                swSrc: './src/serviceWorker/index.ts',
                swDest: 'service-worker.js'
              })
            ]
          : []
      )
    }
  }
} as CracoConfig;
