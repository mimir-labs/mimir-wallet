// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import path, { join } from 'node:path';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { VitePWA } from 'vite-plugin-pwa';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

const packageJson = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'));

export default defineConfig(({ mode }) => ({
  define: {
    'import.meta.env.VERSION': JSON.stringify(packageJson.version)
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
        '../node_modules/@acala-network/chopsticks-core/dist/esm/wasm-executor/browser-wasm-executor.js'
      )
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const workspace = join(import.meta.dirname, '..');

          if (id.includes('node_modules')) {
            const pkg = id.toString().split('node_modules/')[1].split('/')[0];

            if (pkg === 'react' || pkg === 'react-dom') {
              return 'react';
            }

            if (pkg === '@polkadot' && id.includes('@polkadot/apps-config')) {
              return 'polkadot-config';
            }

            return `vendor-${pkg}`;
          }

          if (id.includes(join(workspace, 'packages'))) {
            return 'mimir-vendor';
          }
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
