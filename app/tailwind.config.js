// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import base from '@mimir-wallet/dev/tailwind.config.js';
import heroPlugin from '@mimir-wallet/ui/hero-plugin';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,mdx}'],
  plugins: [heroPlugin],
  presets: [base]
};
