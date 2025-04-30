// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import 'reactflow/dist/style.css';

import { CssBaseline, GlobalStyles } from '@mui/material';

function GlobalStyle() {
  return (
    <>
      <CssBaseline />
      <GlobalStyles
        styles={() => ({
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
          }
        })}
      />
    </>
  );
}

export default GlobalStyle;
