// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import 'reactflow/dist/style.css';

import { CssBaseline, GlobalStyles } from '@mui/material';

function GlobalStyle() {
  return (
    <>
      <CssBaseline />
      <GlobalStyles
        styles={{
          '@font-face': {
            'font-family': 'Sofia Sans Semi Condensed',
            src: "url('/fonts/SofiaSansSemiCondensed-VariableFont_wght.ttf')"
          },
          'body,html': {
            lineHeight: 1.25
          },
          body: {
            background: 'linear-gradient(245.23deg, #F4F2FF 0%, #FBFDFF 100%)'
          },
          ul: {
            paddingLeft: 0,
            margin: 0
          }
        }}
      />
    </>
  );
}

export default GlobalStyle;
