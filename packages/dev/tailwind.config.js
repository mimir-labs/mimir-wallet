// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import defaultConfig from 'tailwindcss/defaultConfig';

/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Sofia Sans Semi Condensed"', ...defaultConfig.theme.fontFamily.sans]
      },
      aspectRatio: {
        '1/1': '1 / 1'
      },
      screens: {
        '3xl': '1920px'
      },
      fontSize: {
        xl: '1.125rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
        '4xl': '1.75rem',
        '5xl': '2rem',
        '6xl': '2.25rem'
      },
      lineHeight: {
        xl: '1.2',
        '2xl': '1.2',
        '3xl': '1.2',
        '4xl': '1.2',
        '5xl': '1.2',
        '6xl': '1.2'
      }
    }
  },
  darkMode: 'class',
  plugins: []
};
