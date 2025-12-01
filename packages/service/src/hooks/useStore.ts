// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BaseStore } from '../store/BaseStore.js';

import { isEqual } from 'lodash-es';
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
  const defaultValueRef = useRef(defaultValue);
  const ref = useRef<BaseStore>(isSession ? session : store);
  // Use lazy initializer to avoid accessing ref during render
  const [value, setValue] = useState<T | undefined>(() =>
    key ? ((isSession ? session : store).get(key) as T) || defaultValue : defaultValue
  );
  const latestValue = useRef<T | undefined>(value);

  // Update refs in useEffect to avoid accessing during render
  useEffect(() => {
    latestValue.current = value;
    defaultValueRef.current = defaultValue;
  });

  useEffect(() => {
    const store = ref.current;

    // Subscribe to store changes (external synchronization)
    const onChange = (_key: string, _: unknown, newValue: unknown) => {
      if (key && key === _key) {
        setValue((value) => {
          if (isEqual(value, newValue)) {
            return value;
          }

          return newValue as T;
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
        if (!key) return;

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
