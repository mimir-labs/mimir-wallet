// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { API_URL_KEY } from './constants';

export class AppConfig {
  public apiUrl = 'ws://127.0.0.1:9944/';

  public loadAll() {
    const apiUrl = localStorage.getItem(API_URL_KEY);

    if (apiUrl) {
      this.apiUrl = apiUrl;
    }
  }

  public setApiUrl(url: string) {
    localStorage.setItem(API_URL_KEY, url);
    window.location.reload();
  }
}
