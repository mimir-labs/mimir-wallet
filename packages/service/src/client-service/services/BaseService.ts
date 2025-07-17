// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { fetcher } from '../../fetcher.js';
import { jsonHeader } from '../defaults.js';

export abstract class BaseService {
  constructor(protected readonly clientGateway: string) {}

  protected getClientUrl(path: string): string {
    const url = new URL('/v1/' + (path.startsWith('/') ? path.slice(1) : path), this.clientGateway);

    return url.toString();
  }

  protected get<T = any>(path: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(this.getClientUrl(path));

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    return fetcher(url.toString(), {
      method: 'GET',
      headers: jsonHeader
    });
  }

  protected post<T = any>(path: string, body?: unknown): Promise<T> {
    return fetcher(this.getClientUrl(path), {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      headers: jsonHeader
    });
  }

  protected put<T = any>(path: string, body?: unknown): Promise<T> {
    return fetcher(this.getClientUrl(path), {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      headers: jsonHeader
    });
  }

  protected patch<T = any>(path: string, body?: unknown): Promise<T> {
    return fetcher(this.getClientUrl(path), {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
      headers: jsonHeader
    });
  }
}
