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
          'body,html': {
            lineHeight: 1.1
          },
          body: {
            background: 'linear-gradient(245deg, #F4F2FF 0%, #FBFDFF 100%)'
          },
          'html,body,#root': {
            minHeight: '100dvh'
          },
          ul: {
            paddingLeft: 0,
            margin: 0
          },
          ':root': {
            '--toastify-text-color-light': `${palette.text.primary} !important`,
            '--toastify-color-info': `${palette.info.main} !important`,
            '--toastify-color-success': `${palette.success.main} !important`,
            '--toastify-color-warning': `${palette.warning.main} !important`,
            '--toastify-color-error': `${palette.error.main} !important`
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
