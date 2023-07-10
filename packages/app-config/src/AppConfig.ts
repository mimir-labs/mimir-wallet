// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { API_URL_KEY, SERVER_URL_KEY } from './constants';

export class AppConfig {
  public apiUrl = 'ws://127.0.0.1:9944/';
  public server = 'http://localhost:8080/';

  public loadAll() {
    const apiUrl = localStorage.getItem(API_URL_KEY);
    const server = localStorage.getItem(SERVER_URL_KEY);

    if (apiUrl) {
      this.apiUrl = apiUrl;
    }

    if (server) {
      this.server = server;
    }
  }

  public setUrl(url: string, server: string) {
    localStorage.setItem(API_URL_KEY, url);
    localStorage.setItem(SERVER_URL_KEY, server);
    window.location.reload();
  }
}
