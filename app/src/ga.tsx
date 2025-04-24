// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import ReactGA from 'react-ga4';

const isBrowser = typeof window !== 'undefined';

export function initGa() {
  if (isBrowser) {
    if (location.hostname === 'app.mimir.global') {
      ReactGA.initialize('G-8GQYDFDBZ6');
    } else if (location.hostname === 'dev.mimir.global') {
      ReactGA.initialize('G-4987GHNZMV');
    }
  }
}

export const gaActions = {
  omniSolochain: (mode: string) => {
    ReactGA.event({
      category: 'TopBar',
      action: 'OmniSoloSwitch',
      label: `Switch to ${mode}`,
      transport: 'beacon'
    });
  }
};
