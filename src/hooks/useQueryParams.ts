// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useMemo } from 'react';
import { NavigateOptions, useSearchParams } from 'react-router-dom';
import * as searchQuery from 'search-query-parser';

export function useQueryParam<T>(key: string, defaultValue?: undefined, options?: NavigateOptions): [T | undefined, (newQuery: T | undefined, options?: NavigateOptions) => void];
export function useQueryParam<T>(key: string, defaultValue: T, options?: NavigateOptions): [T, (newQuery: T | undefined, options?: NavigateOptions) => void];

export function useQueryParam<T>(key: string, defaultValue?: T, options?: NavigateOptions): [T | undefined, (newQuery: T | undefined, options?: NavigateOptions) => void] {
  const [searchParams, setSearchParams] = useSearchParams();
  const paramValue = searchParams.get(key);

  const value = useMemo(() => (paramValue ? (searchQuery.parse(paramValue) as unknown as T) : defaultValue), [defaultValue, paramValue]);

  const setValue = useCallback(
    (newValue: T | undefined, _options?: NavigateOptions) => {
      if (newValue === undefined || newValue === null) {
        const newSearchParams = new URLSearchParams(searchParams);

        newSearchParams.delete(key);
        setSearchParams(newSearchParams);
      } else {
        const newSearchParams = new URLSearchParams(searchParams);

        newSearchParams.set(key, searchQuery.stringify(newValue as any));
        setSearchParams(newSearchParams, {
          ...options,
          ..._options
        });
      }
    },
    [key, options, searchParams, setSearchParams]
  );

  return [value, setValue];
}
