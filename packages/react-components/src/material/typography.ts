// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { type ThemeOptions } from '@mui/material/styles';

type Func = () => NonNullable<ThemeOptions['typography']>;

/**
 * Customized Material UI typography.
 *
 * @see https://mui.com/customization/typography/
 * @see https://mui.com/customization/default-theme/?expand-path=$.typography
 */
const createTypography: Func = () => ({
  fontFamily: [
    'Sofia Sans Semi Condensed',
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    "'Segoe UI'",
    'Helvetica',
    'Arial',
    'sans-serif',
    "'Apple Color Emoji'",
    "'Segoe UI Emoji'",
    "'Segoe UI Symbol'"
  ].join(','),
  h1: {
    fontSize: '2rem',
    fontWeight: 600,
    lineHeight: 1.5,
    '@media (max-width:600px)': {
      fontSize: '1.875rem'
    }
  },
  h2: {
    fontSize: '1.75rem',
    fontWeight: 600,
    lineHeight: 1.5,
    '@media (max-width:600px)': {
      fontSize: '1.625rem'
    }
  },
  h3: {
    fontSize: '1.5rem',
    fontWeight: 500,
    lineHeight: 1.5,
    '@media (max-width:600px)': {
      fontSize: '1.375rem'
    }
  },
  h4: {
    fontSize: '1.25rem',
    fontWeight: 500,
    lineHeight: 1.5
  },
  h5: {
    fontSize: '1.125rem',
    fontWeight: 500,
    lineHeight: 1.5
  },
  h6: {
    fontSize: '1rem',
    fontWeight: 500,
    lineHeight: 1.5
  },
  inherit: {
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: 1.5
  },
  body1: {
    fontSize: '0.875rem'
  }
});

export { createTypography };
