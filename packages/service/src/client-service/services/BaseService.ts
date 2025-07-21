// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { fetcher } from '../../fetcher.js';
import { jsonHeader } from '../defaults.js';

export type ApiVersion = 'v1' | 'v2';

export interface BaseServiceOptions {
  version?: ApiVersion;
}

export abstract class BaseService {
  protected readonly version: ApiVersion;

  constructor(
    protected readonly clientGateway: string,
    options: BaseServiceOptions = {}
  ) {
    this.version = options.version || 'v1';
  }

  protected getClientUrl(path: string, version?: ApiVersion): string {
    const apiVersion = version || this.version;
    const url = new URL(`/${apiVersion}/` + (path.startsWith('/') ? path.slice(1) : path), this.clientGateway);

    return url.toString();
  }

  protected get<T = any>(path: string, params?: Record<string, string>, version?: ApiVersion): Promise<T> {
    const url = new URL(this.getClientUrl(path, version));

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

  protected post<T = any>(path: string, body?: unknown, version?: ApiVersion): Promise<T> {
    return fetcher(this.getClientUrl(path, version), {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      headers: jsonHeader
    });
  }

  protected put<T = any>(path: string, body?: unknown, version?: ApiVersion): Promise<T> {
    return fetcher(this.getClientUrl(path, version), {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      headers: jsonHeader
    });
  }

  protected patch<T = any>(path: string, body?: unknown, version?: ApiVersion): Promise<T> {
    return fetcher(this.getClientUrl(path, version), {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
      headers: jsonHeader
    });
  }
}
