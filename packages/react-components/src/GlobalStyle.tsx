// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CssBaseline, GlobalStyles } from '@mui/material';

function GlobalStyle() {
  return (
    <>
      <CssBaseline />
      <GlobalStyles
        styles={{
          '#root': {
            width: '100%',
            height: '100%'
          }
        }}
      />
    </>
  );
}

export default GlobalStyle;
