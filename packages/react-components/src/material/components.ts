// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PaletteMode } from '@mui/material';
import type { ThemeOptions } from '@mui/material/styles';

declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    neutral: true;
  }
}

type Func = (mode: PaletteMode) => NonNullable<ThemeOptions['components']>;
/**
 * Style overrides for Material UI components.
 *
 * @see https://github.com/mui-org/material-ui/tree/master/packages/mui-material/src
 */
const createComponents: Func = () => ({
  MuiCssBaseline: {
    styleOverrides: `
    #root {
      width: 100%;
      height: 100%;
    }
  `
  }
});

export { createComponents };
