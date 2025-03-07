// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PaletteMode } from '@mui/material';

import { alpha, type PaletteOptions } from '@mui/material/styles';

/**
 * Customized Material UI color palette.
 *
 * @see https://mui.com/customization/palette/
 * @see https://mui.com/customization/default-theme/?expand-path=$.palette
 */
const createPalette = (mode: PaletteMode): PaletteOptions => ({
  mode,
  primary: {
    main: '#2700FF',
    light: '#2700FF',
    dark: '#2700FF',
    contrastText: '#fff'
  },
  success: {
    main: '#00DBA6',
    light: '#00DBA6',
    dark: '#00DBA6',
    contrastText: '#fff'
  },
  error: {
    main: '#FF5310',
    light: '#FF5310',
    dark: '#FF5310',
    contrastText: '#fff'
  },
  warning: {
    main: '#FF8D07',
    light: '#FF8D07',
    dark: '#FF8D07',
    contrastText: '#fff'
  },
  background: { default: '#fff', paper: '#fff' },
  grey: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e6e6e6',
    300: '#d9d9d9',
    400: '#bdbdbd',
    500: '#999999',
    600: '#777777',
    700: '#666666',
    800: '#424242',
    900: '#3a3a3a',
    A100: '#f5f5f5',
    A200: '#eeeeee',
    A400: '#bdbdbd',
    A700: '#666666'
  },
  common: { black: '#151F34', white: '#fff' },
  secondary: {
    main: 'rgba(39, 0, 255, 0.05)',
    light: 'rgba(39, 0, 255, 0.05)',
    dark: 'rgba(39, 0, 255, 0.05)',
    contrastText: '#2700FF'
  },
  info: { main: '#2700FF', light: '#2700FF', dark: '#2700FF', contrastText: '#fff' },
  text: {
    primary: '#151F34',
    secondary: alpha('#151F34', 0.5),
    disabled: alpha('#151F34', 0.38)
  },
  divider: 'rgba(39, 0, 255, 0.05)',
  action: {
    active: 'rgba(39, 0, 255, 0.05)',
    activatedOpacity: 0.05,
    hover: 'rgba(39, 0, 255, 0.05)',
    hoverOpacity: 0.05,
    selected: 'rgba(39, 0, 255, 0.05)',
    selectedOpacity: 0.05,
    disabled: alpha('#151F34', 0.26),
    disabledBackground: alpha('#151F34', 0.12),
    disabledOpacity: 0.38,
    focus: 'rgba(39, 0, 255, 0.05)',
    focusOpacity: 0.12
  }
});

export { createPalette };
