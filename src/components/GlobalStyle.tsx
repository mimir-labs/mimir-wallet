// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import 'reactflow/dist/style.css';

import { CssBaseline, GlobalStyles } from '@mui/material';

function GlobalStyle() {
  return (
    <>
      <CssBaseline />
      <GlobalStyles
        styles={({ palette }) => ({
          '@font-face': {
            'font-family': 'Sofia Sans Semi Condensed',
            src: "url('/fonts/SofiaSansSemiCondensed-VariableFont_wght.ttf')"
          },
          'body,html': {
            lineHeight: 1.2
          },
          body: {
            background: 'linear-gradient(245deg, #F4F2FF 0%, #FBFDFF 100%)'
          },
          'html,body,#root': {
            height: '100%'
          },
          ul: {
            paddingLeft: 0,
            margin: 0
          },
          ':root': {
            '--toastify-text-color-light': palette.text.primary,
            '--toastify-color-info': palette.info.main,
            '--toastify-color-success': palette.success.main,
            '--toastify-color-warning': palette.warning.main,
            '--toastify-color-error': palette.error.main
          },
          '.Toastify__toast-icon': {
            width: 'auto',
            minWidth: 'auto'
          }
        })}
      />
    </>
  );
}

export default GlobalStyle;
