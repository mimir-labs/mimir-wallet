// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PaletteMode } from '@mui/material';
import type { ThemeOptions } from '@mui/material/styles';

type Func = (mode: PaletteMode) => NonNullable<ThemeOptions['components']>;
/**
 * Style overrides for Material UI components.
 *
 * @see https://github.com/mui-org/material-ui/tree/master/packages/mui-material/src
 */
const createComponents: Func = () => ({
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: 'initial',
        borderRadius: '10px'
      },
      startIcon: {
        '>*:nth-of-type(1)': {
          fontSize: '1em'
        }
      },
      endIcon: {
        '>*:nth-of-type(1)': {
          fontSize: '1em'
        }
      }
    }
  },

  MuiIconButton: {
    styleOverrides: {
      sizeSmall: {
        fontSize: '0.75rem'
      },
      sizeMedium: {
        fontSize: '0.875rem'
      },
      sizeLarge: {
        fontSize: '1rem'
      }
    }
  },

  MuiPaper: {
    styleOverrides: {
      outlined: {
        borderRadius: '10px'
      }
    }
  }
});

export { createComponents };
