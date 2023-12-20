// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TxToast, TxToastState } from './types';

import React, { useCallback, useState } from 'react';

interface Props {
  children?: React.ReactNode;
}

export interface TxToastInterface {
  state: TxToastState[];
  addToast: (toast: TxToast) => () => void;
}

let id = 0;

export const TxToastCtx = React.createContext<TxToastInterface>({} as TxToastInterface);

export function TxToastCtxRoot({ children }: Props): React.ReactElement<Props> {
  const [state, setState] = useState<TxToastState[]>([]);

  const addToast = useCallback((toast: TxToast) => {
    const _id = ++id;
    const style = toast.style || 'notification';

    const onRemove = () => {
      setState((state) => state.filter((item) => item.id !== id));
    };

    const onChange =
      style === 'dialog'
        ? () => {
            setState((state) =>
              state.map((item) =>
                item.id === _id
                  ? {
                      ...item,
                      style: 'notification',
                      onChange: undefined
                    }
                  : item
              )
            );
          }
        : undefined;

    setState((state) =>
      state.concat({
        id: _id,
        events: toast.events,
        style,
        onRemove,
        onChange
      })
    );

    return onRemove;
  }, []);

  return <TxToastCtx.Provider value={{ state, addToast }}>{children}</TxToastCtx.Provider>;
}
