// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { heroui } from '@heroui/theme';

export default heroui({
  layout: {
    dividerWeight: '1px',
    radius: {
      small: '5px',
      medium: '10px',
      large: '20px'
    },
    boxShadow: {
      small: '0px 0px 20px 0px rgba(21, 31, 52, 0.06)',
      medium: '0px 0px 20px 0px rgba(21, 31, 52, 0.12)',
      large: '0px 0px 20px 0px rgba(21, 31, 52, 0.20)'
    },
    borderWidth: {
      small: '1px',
      medium: '1px',
      large: '2px'
    },
    fontSize: {
      tiny: '0.75rem',
      small: '0.875rem',
      medium: '1rem',
      large: '1.125rem'
    },
    lineHeight: {
      tiny: '1.2',
      small: '1.2',
      medium: '1.2',
      large: '1.2'
    }
  },
  themes: {
    light: {
      extend: 'light',
      colors: {
        foreground: { DEFAULT: '#151F34' },
        divider: { DEFAULT: '#F5F3FF', 300: '#D9D9D9' },
        primary: {
          foreground: '#FFF',
          50: '#eee6ff',
          100: '#bda3ff',
          200: '#9c7aff',
          300: '#7752ff',
          400: '#5029ff',
          500: '#2700ff',
          600: '#1900d9',
          700: '#0f00b3',
          800: '#07008c',
          900: '#020066',
          DEFAULT: '#2700FF'
        },
        secondary: {
          foreground: '#2700FF',
          DEFAULT: '#f4f2ff'
        },
        success: {
          foreground: '#FFF',
          50: '#e6fff4',
          100: '#a3ffdc',
          200: '#7affd1',
          300: '#4ef5c0',
          400: '#25e8b1',
          500: '#00dba6',
          600: '#00b58e',
          700: '#008f75',
          800: '#006959',
          900: '#00423b',
          DEFAULT: '#00DBA6'
        },
        warning: {
          foreground: '#FFF',
          50: '#fff7e6',
          100: '#ffe3ab',
          200: '#ffd182',
          300: '#ffbd59',
          400: '#ffa530',
          500: '#ff8d07',
          600: '#d96c00',
          700: '#b35300',
          800: '#8c3d00',
          900: '#662900',
          DEFAULT: '#FF8D07'
        },
        danger: {
          foreground: '#FFF',
          50: '#fff1e6',
          100: '#ffd2b3',
          200: '#ffb78a',
          300: '#ff9861',
          400: '#ff7738',
          500: '#ff5310',
          600: '#d93802',
          700: '#b32700',
          800: '#8c1a00',
          900: '#660f00',
          DEFAULT: '#FF5310'
        }
      }
    }
  }
});
