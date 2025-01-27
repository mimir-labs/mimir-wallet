// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ThemeOptions } from '@mui/material/styles';

import { type PaletteMode, SvgIcon } from '@mui/material';

import IconInfo from '@mimir-wallet/assets/svg/icon-info-fill.svg?react';

type Func = (mode: PaletteMode) => NonNullable<ThemeOptions['components']>;
/**
 * Style overrides for Material UI components.
 *
 * @see https://github.com/mui-org/material-ui/tree/master/packages/mui-material/src
 */
const createComponents: Func = () => ({
  MuiCssBaseline: {
    styleOverrides: `
    ::-webkit-scrollbar {
      width: 5px;
      height: 5px;
      background: #fff;
    }
    ::-webkit-scrollbar-track {
      background: transparent;
      border-radius: 5px;
    }
    ::-webkit-scrollbar-thumb {
      background: #d9d9d9;
      border-radius: 5px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #d9d9d9;
    }
    ::-webkit-scrollbar-corner {
      background: #d9d9d9;
    }
`
  },

  MuiLoadingButton: {
    defaultProps: { variant: 'contained' }
  },

  MuiButton: {
    defaultProps: { variant: 'contained' },
    styleOverrides: {
      root: () => ({
        fontWeight: 700,
        lineHeight: 1.1,
        textTransform: 'initial',
        '>.MuiSvgIcon-root': {
          fontSize: '1.2em'
        }
      }),
      outlined: ({ ownerState, theme }) => ({
        borderColor: ownerState.color !== 'inherit' ? theme.palette[ownerState.color || 'primary'].main : undefined,
        ':hover': {
          backgroundColor:
            ownerState.color !== 'inherit' ? theme.palette[ownerState.color || 'primary'].main : undefined,
          color: ownerState.color !== 'inherit' ? theme.palette[ownerState.color || 'primary'].contrastText : undefined
        }
      }),
      startIcon: {
        '>*:nth-of-type(1)': {
          fontSize: '1.2em'
        }
      },
      endIcon: {
        '>*:nth-of-type(1)': {
          fontSize: '1.2em'
        }
      },
      sizeLarge: {
        fontSize: '1rem',
        borderRadius: '20px',
        padding: '8px 20px',
        lineHeight: 1.1
      },
      sizeMedium: {
        fontSize: '0.875rem',
        borderRadius: '19px',
        padding: '8px 15px',
        lineHeight: 1.1
      },
      sizeSmall: {
        fontSize: '0.875rem',
        borderRadius: '15px',
        padding: '5px 10px',
        lineHeight: 1.1
      }
    }
  },

  MuiIconButton: {
    styleOverrides: {
      root: {
        '>.MuiSvgIcon-root': {
          fontSize: '1.2em'
        }
      },
      sizeLarge: {
        fontSize: '1rem',
        lineHeight: 1.1
      },
      sizeMedium: {
        fontSize: '0.875rem',
        lineHeight: 1.1
      },
      sizeSmall: {
        fontSize: '0.875rem',
        lineHeight: 1.1
      }
    }
  },

  MuiSvgIcon: {
    defaultProps: {
      fontSize: 'inherit'
    },
    styleOverrides: {
      fontSizeInherit: {
        fontSize: '1.2em'
      },
      fontSizeSmall: {
        fontSize: '0.75rem'
      },
      fontSizeLarge: {
        fontSize: '1.25rem'
      },
      fontSizeMedium: {
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
            borderColor: palette.grey[300],
            backgroundColor: palette.secondary.main
          }
        }
      }),
      input: {
        height: 'auto',
        lineHeight: 1,
        padding: 10
      }
    }
  },

  MuiFormHelperText: {
    styleOverrides: {
      root: ({ theme }) => ({
        marginTop: theme.spacing(0.5),
        marginRight: 0,
        marginLeft: 0
      })
    }
  },

  MuiAutocomplete: {
    styleOverrides: {
      popupIndicator: ({ theme }) => ({
        color: theme.palette.text.primary,
        fontSize: '1.5rem'
      })
    }
  },

  MuiChip: {
    styleOverrides: {
      root: {
        height: 'auto',
        padding: '3px 0',
        fontWeight: 600,
        lineHeight: 1
      },
      sizeMedium: {
        fontSize: '0.875rem'
      },
      sizeSmall: {
        fontSize: '0.75rem'
      },
      label: {
        fontWeight: 400
      },
      labelSmall: {
        padding: '0 10px'
      },
      labelMedium: {
        padding: '0 10px'
      }
    }
  },

  MuiSwitch: {
    styleOverrides: {
      switchBase: ({ theme }) => ({
        top: 0,
        left: 2,
        padding: 0,
        height: '100%',
        color: theme.palette.grey[300],
        '&.Mui-checked': {
          transform: 'translateX(20px)',
          color: theme.palette.common.white
        },
        '&.Mui-checked+.MuiSwitch-track': {
          opacity: 1,
          borderColor: theme.palette.primary.main,
          backgroundColor: theme.palette.primary.main
        }
      }),
      thumb: {
        width: 16,
        height: 16
      },
      track: ({ theme }) => ({
        opacity: 1,
        height: '100%',
        border: '1px solid',
        borderColor: theme.palette.grey[300],
        backgroundColor: 'transparent',
        borderRadius: 10
      }),
      root: () => ({
        width: 40,
        height: 20,
        padding: 0
      })
    }
  },

  MuiDialog: {
    styleOverrides: {
      root: ({ theme }) => ({
        '.MuiDialog-paper': {
          padding: theme.spacing(2),
          [theme.breakpoints.down('md')]: {
            maxWidth: 'calc(100% - 40px)',
            maxHeight: 'calc(100% - 40px)',
            margin: '20px',
            padding: '20px'
          },
          [theme.breakpoints.down('sm')]: {
            maxWidth: 'calc(100% - 30px)',
            maxHeight: 'calc(100% - 30px)',
            margin: '15px',
            padding: '15px'
          }
        },
        '.MuiDialog-paperFullWidth': {
          [theme.breakpoints.down('md')]: {
            width: 'calc(100% - 40px)'
          },
          [theme.breakpoints.down('sm')]: {
            width: 'calc(100% - 30px)'
          }
        }
      })
    }
  },

  MuiDialogTitle: {
    styleOverrides: {
      root: ({ theme }) => ({
        fontSize: '1.25rem',
        fontWeight: 800,
        padding: 0,
        paddingBottom: theme.spacing(1.5),
        '+.MuiDialogContent-root': {
          borderTop: `1px solid ${theme.palette.divider}`,
          paddingTop: `${theme.spacing(1.5)} !important`
        }
      })
    }
  },

  MuiDialogContent: {
    styleOverrides: {
      root: () => ({
        padding: 0
      })
    }
  },

  MuiDialogActions: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderTop: `1px solid ${theme.palette.divider}`,
        marginTop: theme.spacing(1.5),
        padding: 0,
        paddingTop: theme.spacing(1.5)
      })
    }
  },

  MuiDivider: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderColor: theme.palette.divider
      })
    }
  },

  MuiAccordion: {
    styleOverrides: {
      root: ({ theme }) => ({
        background: theme.palette.secondary.main,
        padding: theme.spacing(1),
        borderRadius: theme.shape.borderRadius * 2,
        ':first-of-type': {
          borderTopLeftRadius: theme.shape.borderRadius * 2,
          borderTopRightRadius: theme.shape.borderRadius * 2
        },
        ':last-of-type': {
          borderBottomLeftRadius: theme.shape.borderRadius * 2,
          borderBottomRightRadius: theme.shape.borderRadius * 2
        }
      })
    }
  },

  MuiAccordionSummary: {
    styleOverrides: {
      root: ({ theme }) => ({
        backgroundColor: theme.palette.secondary.main,
        color: theme.palette.text.primary,
        fontSize: '0.875rem',
        fontWeight: 700,
        margin: 0,
        height: 40,
        minHeight: 40,
        borderRadius: 20,
        padding: 0,
        '&.Mui-expanded': {
          minHeight: 40
        }
      }),
      content: {
        display: 'flex',
        alignItems: 'center',
        '&.Mui-expanded': {
          margin: 0
        }
      }
    }
  },

  MuiAccordionDetails: {
    styleOverrides: {
      root: ({ theme }) => ({
        padding: `${theme.spacing(1)} 0`,
        color: theme.palette.text.primary
      })
    }
  },

  MuiTooltip: {
    styleOverrides: {
      tooltip: ({ theme }) => ({
        maxWidth: 365,
        fontSize: '0.875rem',
        borderRadius: theme.shape.borderRadius * 2,
        padding: theme.spacing(1),
        border: '1px solid',
        borderColor: theme.palette.secondary.main,
        backgroundColor: theme.palette.common.white,
        color: theme.palette.text.primary,
        boxShadow: theme.shadows[1]
      })
    }
  },

  MuiListItem: {
    styleOverrides: {
      root: {
        padding: '5px 10px'
      }
    }
  },

  MuiTypography: {
    styleOverrides: {
      root: {
        lineHeight: 1.1
      }
    }
  },

  MuiSelect: {
    styleOverrides: {
      select: {
        minHeight: '1.375rem',
        lineHeight: '1.375rem'
      }
    }
  },

  MuiAlert: {
    defaultProps: {
      iconMapping: {
        error: <SvgIcon inheritViewBox component={IconInfo} sx={{ fontSize: '0.875rem' }} />,
        warning: <SvgIcon inheritViewBox component={IconInfo} sx={{ fontSize: '0.875rem' }} />
      }
    }
  },

  MuiList: {
    styleOverrides: {
      root: {
        '&.MuiMenu-list': {
          padding: '8px'
        }
      }
    }
  },

  MuiMenuItem: {
    styleOverrides: {
      root: {
        borderRadius: '5px'
      }
    }
  },

  MuiTableCell: {
    styleOverrides: {
      head: {
        fontWeight: 700
      }
    }
  }
});

export { createComponents };
