// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import tanstackRouter from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { VitePWA } from 'vite-plugin-pwa';
import svgr from 'vite-plugin-svgr';
import wasm from 'vite-plugin-wasm';
import tsconfigPaths from 'vite-tsconfig-paths';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Collect dependencies from all workspace package.json files
function collectAllDependencies(): Set<string> {
  const deps = new Set<string>();

  const packagePaths = [
    resolve(__dirname, 'package.json'), // app
    resolve(__dirname, '../packages/polkadot-core/package.json'), // polkadot-core
    resolve(__dirname, '../packages/service/package.json'), // service
    resolve(__dirname, '../packages/ui/package.json'), // ui
    resolve(__dirname, '../packages/ai-assistant/package.json'), // ai-assistant
  ];

  for (const pkgPath of packagePaths) {
    if (existsSync(pkgPath)) {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
      const dependencies = pkg.dependencies || {};

      for (const dep of Object.keys(dependencies)) {
        // Skip workspace dependencies (local packages)
        if (!dependencies[dep].startsWith('workspace:')) {
          deps.add(dep);
        }
      }
    }
  }

  return deps;
}

const allDependencies = collectAllDependencies();

// Extract package name from module ID (supports both pnpm and standard node_modules)
function getPackageName(id: string): string | null {
  if (!id.includes('node_modules')) return null;

  // Handle pnpm's nested structure: node_modules/.pnpm/pkg@version/node_modules/pkg
  if (id.includes('node_modules/.pnpm/')) {
    // Get the last node_modules segment (actual package location)
    const parts = id.split('node_modules/');
    const lastPart = parts[parts.length - 1];
    const segments = lastPart.split('/');

    // Handle scoped packages (@scope/name)
    if (segments[0].startsWith('@')) {
      return `${segments[0]}/${segments[1]}`;
    }

    return segments[0];
  }

  // Standard node_modules structure
  const parts = id.split('node_modules/')[1].split('/');

  if (parts[0].startsWith('@')) {
    return `${parts[0]}/${parts[1]}`;
  }

  return parts[0];
}

const packageJson = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf-8'),
);

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
    rollupOptions: {
      output: {
        manualChunks(id) {
          const pkg = getPackageName(id);

          if (!pkg) return undefined;

          // React special handling - merge react & react-dom
          if (pkg === 'react' || pkg === 'react-dom') {
            return 'react';
          }

          // Skip packages with circular dependency issues - let Vite handle them
          if (
            pkg.startsWith('@acala-network') ||
            pkg === 'react-syntax-highlighter'
          ) {
            return undefined;
          }

          // Separate @polkadot/apps-config from other @polkadot packages (large config data)
          if (pkg === '@polkadot/apps-config') {
            return 'vendor-polkadot-config';
          }

          // Only create vendor chunk for explicitly declared dependencies
          if (allDependencies.has(pkg)) {
            // Use scope for scoped packages (e.g., @polkadot/api -> vendor-@polkadot)
            const scope = pkg.startsWith('@') ? pkg.split('/')[0] : pkg;

            return `vendor-${scope}`;
          }

          return undefined;
        },
      },
    },
  },
  plugins: [
    tsconfigPaths(),
    tanstackRouter(), // Must be before react()
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
    nodePolyfills({
      // To add only specific polyfills, add them here. If no option is passed, adds all polyfills
      include: ['crypto', 'path'],
    }),
  ].filter(Boolean),
}));
