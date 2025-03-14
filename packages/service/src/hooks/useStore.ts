// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BaseStore } from '../store/BaseStore.js';

import { useCallback, useEffect, useRef, useState } from 'react';

import { session, store } from '../store/index.js';

export function useStore<T>(
  isSession: boolean,
  key: string
): [T | undefined, (value: T | ((value: T | undefined) => T)) => void];
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
  const latestValue = useRef<T | undefined>(value);

  latestValue.current = value;

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
      (_value: T | ((value: T) => T)) => {
        if (typeof _value === 'function') {
          const newValue = (_value as (v: T | undefined) => T)(latestValue.current);

          ref.current.set(key, newValue);
        } else {
          ref.current.set(key, _value);
        }
      },
      [key]
    )
  ];
}

export function useLocalStore<T>(key: string): [T | undefined, (value: T | ((value: T | undefined) => T)) => void];
export function useLocalStore<T>(key: string, defaultValue: T): [T, (value: T | ((value: T) => T)) => void];

export function useLocalStore<T>(
  key: string,
  defaultValue?: T
): [T | undefined, (value: T | ((value: T) => T)) => void] {
  return useStore<T>(false, key, defaultValue as T);
}

export function useSessionStore<T>(key: string): [T | undefined, (value: T | ((value: T | undefined) => T)) => void];
export function useSessionStore<T>(key: string, defaultValue: T): [T, (value: T | ((value: T) => T)) => void];

export function useSessionStore<T>(
  key: string,
  defaultValue?: T
): [T | undefined, (value: T | ((value: T) => T)) => void] {
  return useStore<T>(true, key, defaultValue as T);
}
