// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { REFERRER_KEY } from '@mimir-wallet/constants';

export const referrer: string | null = initializeReferrer();

function initializeReferrer(): string | null {
  const url = new URL(window.location.href);

  const referrer = url.searchParams.get('referrer');

  if (referrer) {
    sessionStorage.setItem(REFERRER_KEY, referrer);
  }

  return sessionStorage.getItem(REFERRER_KEY);
}
