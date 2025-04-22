// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import ReactGA from 'react-ga4';

const isBrowser = typeof window !== 'undefined';

export function initGa() {
  if (isBrowser) {
    if (location.hostname === 'app.mimir.global') {
      ReactGA.initialize('G-2MD2S3XXRG');
    } else if (location.hostname === 'dev.mimir.global') {
      ReactGA.initialize('G-4987GHNZMV');
    }
  }
}
