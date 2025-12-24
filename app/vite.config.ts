// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { readFileSync } from 'node:fs';

import tanstackRouter from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { VitePWA } from 'vite-plugin-pwa';
import svgr from 'vite-plugin-svgr';
import wasm from 'vite-plugin-wasm';
import tsconfigPaths from 'vite-tsconfig-paths';

const packageJson = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf-8'),
);

// Read UI package dependencies for chunking
const uiPackageJson = JSON.parse(
  readFileSync(
    new URL('../packages/ui/package.json', import.meta.url),
    'utf-8',
  ),
);
const uiDependencies = Object.keys(uiPackageJson.dependencies || {}).filter(
  (dep) => !dep.startsWith('@mimir-wallet/') && !dep.startsWith('workspace:'),
);

/**
 * Manual Chunks Strategy for Optimal Caching
 *
 * Chunk priority (matched from top to bottom):
 *   1. Shared primitives (shared-*) - Extracted first to prevent cascading cache invalidation
 *   2. Framework layer - React core and state management
 *   3. Utility layer - Common tools like lodash, rxjs
 *   4. Domain libraries - Blockchain integrations (polkadot, walletconnect)
 *   5. UI layer - Component libraries and animations
 *   6. Feature libraries - Specific functionality (charts, flow, etc.)
 *
 * Naming convention:
 *   - shared-*: Libraries used by multiple vendor chunks (crypto, polyfills)
 *   - vendor-*: Independent vendor libraries
 */
function manualChunks(id: string): string | undefined {
  if (!id.includes('node_modules')) {
    return undefined;
  }

  // ============================================================================
  // Layer 1: Shared Primitives (shared-*)
  // These are extracted first to prevent cascading cache invalidation
  // ============================================================================

  // polyfills - required by many libraries
  if (
    id.includes('/vite-plugin-node-polyfills@') ||
    id.includes('@babel/') ||
    id.includes('/tslib@')
  ) {
    return 'shared-polyfills';
  }

  // Cryptographic primitives - used by @polkadot, @walletconnect, and others
  if (
    id.includes('@noble/') ||
    id.includes('@scure/') ||
    id.includes('/bn.js@') ||
    id.includes('/tweetnacl@')
  ) {
    return 'shared-crypto';
  }

  // ============================================================================
  // Layer 2: Framework Layer
  // ============================================================================

  // React core - must be loaded before any React components
  if (
    id.includes('/react@') ||
    id.includes('/react-dom@') ||
    id.includes('/scheduler@')
  ) {
    return 'vendor-react';
  }

  // TanStack ecosystem - routing, query, table, virtual
  if (id.includes('@tanstack/')) {
    return 'vendor-tanstack';
  }

  // ============================================================================
  // Layer 3: Utility Layer
  // ============================================================================

  // Common utility libraries
  if (
    id.includes('/lodash-es@') ||
    id.includes('/lodash@') ||
    id.includes('/rxjs@')
  ) {
    return 'vendor-util';
  }

  // ============================================================================
  // Layer 4: Domain Libraries (Blockchain)
  // ============================================================================

  // Polkadot ecosystem - core blockchain functionality
  if (id.includes('@polkadot/') || id.includes('@polkadot-api/')) {
    // Separate apps-config due to its large size and frequent updates
    if (id.includes('@polkadot/apps-config')) {
      return 'vendor-polkadot-config';
    }

    return 'vendor-polkadot';
  }

  // Paraspell - XCM cross-chain transfers (separate for independent updates)
  if (id.includes('@paraspell/')) {
    return 'vendor-paraspell';
  }

  // WalletConnect - wallet connection protocol
  if (id.includes('@walletconnect/')) {
    return 'vendor-walletconnect';
  }

  // ============================================================================
  // Layer 5: UI Layer
  // ============================================================================

  // UI component dependencies (Radix, ShadCN primitives, etc.)
  // Note: pnpm uses + instead of / for scoped packages in node_modules paths
  // e.g., @radix-ui/react-dialog becomes @radix-ui+react-dialog
  if (uiDependencies.some((dep) => id.includes(`/${dep.replace('/', '+')}`))) {
    return 'vendor-ui';
  }

  // Icon library
  if (id.includes('/lucide-react@')) {
    return 'vendor-icons';
  }

  // Animation library
  if (id.includes('/framer-motion@')) {
    return 'vendor-framer';
  }

  // ============================================================================
  // Layer 6: Feature Libraries
  // ============================================================================

  // Flow diagram library
  if (id.includes('@xyflow/')) {
    return 'vendor-xyflow';
  }

  // Chart libraries
  if (id.includes('/chart.js@') || id.includes('/react-chartjs@')) {
    return 'vendor-charts';
  }

  // Lottie animations
  if (id.includes('/lottie-web@')) {
    return 'vendor-lottie';
  }

  // Real-time communication
  if (
    id.includes('/socket.io') ||
    id.includes('/engine.io') ||
    id.includes('/@socket.io/')
  ) {
    return 'vendor-socket';
  }

  // Let Vite handle remaining small libraries automatically
  return undefined;
}

export default defineConfig(({ mode }) => ({
  define: {
    'import.meta.env.VERSION': JSON.stringify(packageJson.version),
  },
  server: {
    host: '0.0.0.0',
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
        '100': true,
      },
      provider: 'istanbul',
      enabled: true,
      reporter: ['text', 'lcov'],
      reportsDirectory: 'coverage',
    },
  },
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks,
      },
    },
  },
  plugins: [
    tsconfigPaths(),
    tanstackRouter(),
    react({ babel: { plugins: ['babel-plugin-react-compiler'] } }),
    wasm(),
    svgr({ svgrOptions: { ref: true } }),
    ...(mode === 'test'
      ? []
      : [
          VitePWA({
            strategies: 'injectManifest',
            srcDir: 'src/service-workers',
            filename: 'service-worker.ts',
            registerType: 'autoUpdate',
            includeAssets: [
              'favicon.png',
              'robots.txt',
              'apple-touch-icon.png',
              'icons/*.svg',
              'fonts/*.woff2',
            ],
            injectManifest: {
              maximumFileSizeToCacheInBytes: 3000000,
              globPatterns: [
                'index.html',
                'assets/index-*.js',
                'assets/index-*.css',
              ],
              buildPlugins: {
                vite: [tsconfigPaths()],
              },
            },
            manifest: {
              theme_color: '#BD34FE',
              icons: [
                {
                  src: '/android-chrome-192x192.png',
                  sizes: '192x192',
                  type: 'image/png',
                  purpose: 'any maskable',
                },
                {
                  src: '/android-chrome-512x512.png',
                  sizes: '512x512',
                  type: 'image/png',
                },
              ],
            },
          }),
        ]),
    nodePolyfills(),
  ].filter(Boolean),
}));
