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
        textTransform: 'initial'
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

  MuiInputLabel: {
    styleOverrides: {
      outlined: ({ theme }) => ({
        position: 'relative',
        transform: 'none',
        fontWeight: 700,
        fontSize: '0.875rem',
        marginBottom: theme.spacing(0.75),
        color: theme.palette.text.primary
      })
    }
  },

  MuiOutlinedInput: {
    styleOverrides: {
      root: ({ theme: { palette } }) => ({
        '.MuiOutlinedInput-notchedOutline': {
          borderColor: palette.grey[300]
        },
        '&.Mui-disabled': {
          '.MuiOutlinedInput-notchedOutline': {
            borderColor: palette.grey[300]
          }
        }
      })
    }
  },

  MuiPaper: {
    styleOverrides: {
      outlined: ({ theme }) => ({
        borderColor: theme.palette.grey[300]
      })
    }
  },

  MuiChip: {
    styleOverrides: {
      root: {
        fontSize: 12,
        lineHeight: '14px'
      },
      sizeSmall: {
        height: 24
      },
      labelSmall: {
        padding: '0px 5px'
      },
      sizeMedium: {
        height: 24
      },
      labelMedium: {
        padding: '0px 10px'
      }
    }
  },

  MuiAutocomplete: {
    styleOverrides: {
      popupIndicator: ({ theme }) => ({
        color: theme.palette.text.primary
      })
    }
  },

  MuiDialog: {
    styleOverrides: {
      paper: () => ({
        borderRadius: 20
      })
    }
  },

  MuiDialogContent: {
    styleOverrides: {
      root: ({ theme }) => ({
        padding: theme.spacing(2)
      })
    }
  },

  MuiDialogActions: {
    styleOverrides: {
      root: ({ theme }) => ({
        padding: theme.spacing(2)
      })
    }
  },

  MuiStepLabel: {
    styleOverrides: {
      root: {
        '.MuiStepLabel-label': {
          fontWeight: '700 !important'
        },
        '&.Mui-active .MuiStepLabel-label': {
          fontWeight: '700 !important'
        }
      }
    }
  }
});

export { createComponents };
