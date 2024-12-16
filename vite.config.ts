// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import eslintPlugin from '@nabla/vite-plugin-eslint';
import react from '@vitejs/plugin-react-swc';
import { readFileSync } from 'fs';
import path from 'node:path';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { VitePWA } from 'vite-plugin-pwa';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

const packageJson = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'));

export default defineConfig(({ mode }) => ({
  define: {
    'process.env.VERSION': JSON.stringify(packageJson.version)
  },
  server: {
    host: '0.0.0.0'
  },
  test: {
    css: false,
    include: ['src/**/__tests__/*'],
    globals: true,
    environment: 'jsdom',
    setupFiles: 'src/setupTests.ts',
    clearMocks: true,
    coverage: {
      include: ['src/**/*'],
      exclude: ['src/main.tsx'],
      thresholds: {
        '100': true
      },
      provider: 'istanbul',
      enabled: true,
      reporter: ['text', 'lcov'],
      reportsDirectory: 'coverage'
    }
  },
  resolve: {
    alias: {
      'browser-wasm-executor.js': path.resolve(
        'node_modules/@acala-network/chopsticks-core/dist/esm/wasm-executor/browser-wasm-executor.js'
      )
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          polkadot: [
            '@polkadot/api',
            '@polkadot/api-augment',
            '@polkadot/api-base',
            '@polkadot/api-derive',
            '@polkadot/react-identicon',
            '@polkadot/types',
            '@polkadot/types-codec',
            '@polkadot/types-known',
            '@polkadot/util',
            '@polkadot/util-crypto'
          ],
          chopsticks: ['@acala-network/chopsticks-core'],
          'polkadot-config': ['@polkadot/apps-config/api/typesBundle'],
          mui: ['@mui/lab', '@mui/material', '@mui/system', 'material-ui-popup-state'],
          reactflow: ['reactflow'],
          lottie: ['lottie-web'],
          lodash: ['lodash-es', 'lodash'],
          common: [
            'copy-to-clipboard',
            'json2mq',
            'moment',
            'qrcode-generator',
            'react-ga4',
            'react-json-view',
            'jsondiffpatch',
            'react-toastify',
            'socket.io-client',
            '@tanstack/react-query',
            'react-draggable-list',
            'papaparse'
          ]
        }
      }
    }
  },
  plugins: [
    tsconfigPaths(),
    react(),
    svgr({ svgrOptions: { ref: true } }),
    ...(mode === 'test'
      ? []
      : [
          eslintPlugin(),
          VitePWA({
            strategies: 'injectManifest',
            srcDir: 'src/service-workers',
            filename: 'service-worker.ts',
            registerType: 'autoUpdate',
            includeAssets: ['favicon.png', 'robots.txt', 'apple-touch-icon.png', 'icons/*.svg', 'fonts/*.woff2'],
            injectManifest: {
              maximumFileSizeToCacheInBytes: 3000000,
              buildPlugins: {
                vite: [tsconfigPaths()]
              }
            },
            manifest: {
              theme_color: '#BD34FE',
              icons: [
                {
                  src: '/android-chrome-192x192.png',
                  sizes: '192x192',
                  type: 'image/png',
                  purpose: 'any maskable'
                },
                {
                  src: '/android-chrome-512x512.png',
                  sizes: '512x512',
                  type: 'image/png'
                }
              ]
            }
          })
        ]),
    nodePolyfills({
      // To add only specific polyfills, add them here. If no option is passed, adds all polyfills
      include: ['crypto']
    })
  ]
}));
