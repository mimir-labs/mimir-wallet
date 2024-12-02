// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PaletteMode, Theme } from '@mui/material';

import { createTheme as createMuiTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import * as React from 'react';

import { createComponents } from './components';
import { createPalette } from './palette';
import { createTypography } from './typography';

type ThemeProviderProps = {
  children: React.ReactNode;
};

/**
 * Creates a customized version of Material UI theme.
 *
 * @see https://mui.com/customization/theming/
 * @see https://mui.com/customization/default-theme/
 */
function createTheme(mode: PaletteMode): Theme {
  return createMuiTheme({
    palette: createPalette(mode),
    components: createComponents(mode),
    typography: createTypography(),
    shape: { borderRadius: 10 },
    shadows: [
      'none',
      '0px 0px 10px rgba(21, 31, 52, 0.06)',
      '0px 0px 11px rgba(21, 31, 52, 0.07)',
      '0px 0px 12px rgba(21, 31, 52, 0.08)',
      '0px 0px 13px rgba(21, 31, 52, 0.09)',
      '0px 0px 14px rgba(21, 31, 52, 0.10)',
      '0px 0px 15px rgba(21, 31, 52, 0.11)',
      '0px 0px 16px rgba(21, 31, 52, 0.12)',
      '0px 0px 17px rgba(21, 31, 52, 0.13)',
      '0px 0px 18px rgba(21, 31, 52, 0.14)',
      '0px 0px 19px rgba(21, 31, 52, 0.15)',
      '0px 0px 20px rgba(21, 31, 52, 0.16)',
      '0px 0px 21px rgba(21, 31, 52, 0.17)',
      '0px 0px 22px rgba(21, 31, 52, 0.18)',
      '0px 0px 23px rgba(21, 31, 52, 0.19)',
      '0px 0px 24px rgba(21, 31, 52, 0.20)',
      '0px 0px 25px rgba(21, 31, 52, 0.21)',
      '0px 0px 26px rgba(21, 31, 52, 0.22)',
      '0px 0px 27px rgba(21, 31, 52, 0.23)',
      '0px 0px 28px rgba(21, 31, 52, 0.24)',
      '0px 0px 29px rgba(21, 31, 52, 0.25)',
      '0px 0px 30px rgba(21, 31, 52, 0.26)',
      '0px 0px 31px rgba(21, 31, 52, 0.27)',
      '0px 0px 32px rgba(21, 31, 52, 0.28)',
      '0px 0px 33px rgba(21, 31, 52, 0.29)'
    ],
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 900,
        lg: 1280,
        xl: 1536
      }
    },
    spacing: 10
  });
}

const ToggleThemeContext = React.createContext(() => {});

function ThemeProvider({ children }: ThemeProviderProps): JSX.Element {
  const [theme, setTheme] = React.useState(() => createTheme('light'));

  const toggleTheme = React.useCallback(() => {
    setTheme((theme) => createTheme(theme.palette.mode === 'light' ? 'dark' : 'light'));
  }, []);

  return (
    <MuiThemeProvider theme={theme}>
      <ToggleThemeContext.Provider value={toggleTheme}>{children}</ToggleThemeContext.Provider>
    </MuiThemeProvider>
  );
}

export { ThemeProvider, ToggleThemeContext };
