// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect } from 'react';

import { useApi } from '../useApi';

interface Props {
  children?: React.ReactNode;
}

export const BlockEventCtx = React.createContext({});

export function BlockEventCtxRoot({ children }: Props): React.ReactElement<Props> {
  const { api, isApiReady } = useApi();

  useEffect(() => {
    if (isApiReady) {
      api.query.system.events((events) => {
        events.forEach(() => {
          // const { event, phase } = record;
          // Show what we are busy with
          // console.log(`\t${event.section}:${event.method}:: (phase=${phase.toString()})`);
        });
      });
    }
  });

  // eslint-disable-next-line react/jsx-no-constructed-context-values
  return <BlockEventCtx.Provider value={{}}>{children}</BlockEventCtx.Provider>;
}
