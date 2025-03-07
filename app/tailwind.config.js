// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import base from '@mimir-wallet/dev/tailwind.config.js';
import heroPlugin from '@mimir-wallet/ui/hero-plugin';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
    '../node_modules/@mimir-wallet/ui/build/**/*.{js,ts,jsx,tsx}'
  ],
  plugins: [heroPlugin],
  presets: [base]
};
