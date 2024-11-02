// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect, useRef, useState } from 'react';

import { session, store } from '@mimir-wallet/utils';
import { BaseStore } from '@mimir-wallet/utils/store/BaseStore';

export function useStore<T>(isSession: boolean, key: string): [T | undefined, (value: T | ((value: T) => T)) => void];
export function useStore<T>(
  isSession: boolean,
  key: string,
  defaultValue: T
): [T, (value: T | ((value: T) => T)) => void];

export function useStore<T>(
  isSession: boolean,
  key: string,
  defaultValue?: T
): [T | undefined, (value: T | ((value: T) => T)) => void] {
  const ref = useRef<BaseStore>(isSession ? session : store);
  const [value, setValue] = useState<T | undefined>((ref.current.get(key) as T) || defaultValue);

  useEffect(() => {
    const store = ref.current;

    const onChange = (_key: string, _: unknown, newValue: unknown) => {
      if (key === _key) {
        setTimeout(() => {
          setValue((value) => {
            if (JSON.stringify(value) === JSON.stringify(newValue)) {
              return value;
            }

            return newValue as T;
          });
        });
      }
    };

    store.on('store_changed', onChange);

    return () => {
      store.off('store_changed', onChange);
    };
  }, [key]);

  return [
    value || defaultValue,
    useCallback(
      (value: T | ((value: T) => T)) => {
        setValue((oldValue) => {
          let newValue: T;

          if (typeof value === 'function') {
            newValue = (value as (v: T | undefined) => T)(oldValue);
          } else {
            newValue = value;
          }

          ref.current.set(key, newValue);

          return newValue;
        });
      },
      [key]
    )
  ];
}

export function useLocalStore<T>(key: string): [T | undefined, (value: T | ((value: T) => T)) => void];
export function useLocalStore<T>(key: string, defaultValue: T): [T, (value: T | ((value: T) => T)) => void];

export function useLocalStore<T>(
  key: string,
  defaultValue?: T
): [T | undefined, (value: T | ((value: T) => T)) => void] {
  return useStore<T>(false, key, defaultValue as T);
}

export function useSessionStore<T>(key: string): [T | undefined, (value: T | ((value: T) => T)) => void];
export function useSessionStore<T>(key: string, defaultValue: T): [T, (value: T | ((value: T) => T)) => void];

export function useSessionStore<T>(
  key: string,
  defaultValue?: T
): [T | undefined, (value: T | ((value: T) => T)) => void] {
  return useStore<T>(true, key, defaultValue as T);
}
