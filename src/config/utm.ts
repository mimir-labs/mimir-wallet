// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { UTM_KEY } from '@mimir-wallet/constants';

export type UTM = {
  utm_source: string;
  utm_medium?: string | null;
  utm_campaign?: string | null;
} | null;

export const utm: UTM = initializeUTM();

function initializeUTM(): UTM {
  const url = new URL(window.location.href);

  const utm_source = url.searchParams.get('utm_source');

  if (utm_source) {
    const utm_medium = url.searchParams.get('utm_medium');
    const utm_campaign = url.searchParams.get('utm_campaign');

    sessionStorage.setItem(UTM_KEY, JSON.stringify({ utm_source, utm_medium, utm_campaign }));
  }

  const utmStr = sessionStorage.getItem(UTM_KEY);

  return utmStr ? JSON.parse(utmStr) : null;
}
