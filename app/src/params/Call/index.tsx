// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { CallProps } from './types';

import React, { forwardRef, useMemo, useRef } from 'react';

import { findAction } from '@mimir-wallet/polkadot-core';

import BatchCall from './BatchCall';
import CancelAsMulti from './CancelAsMulti';
import FunctionArgs from './FunctionArgs';
import SetIdentity from './SetIdentity';
import TransferCall from './TransferCall';
import { useRefState } from './withRenderState';

type MatchType = 'exact' | 'prefix';

type CallComponent = React.MemoExoticComponent<
  React.ForwardRefExoticComponent<CallProps & React.RefAttributes<HTMLDivElement | null>>
>;

interface ComponentConfig {
  component: CallComponent;
  actions: string[];
  matchType: MatchType;
}

const componentDef: ComponentConfig[] = [
  {
    component: BatchCall,
    actions: ['utility.batchAll', 'utility.batch', 'utility.forceBatch'],
    matchType: 'exact'
  },
  {
    component: CancelAsMulti,
    actions: ['multisig.cancelAsMulti'],
    matchType: 'exact'
  },
  {
    component: TransferCall,
    actions: ['balances.', 'assets.', 'tokens.'],
    matchType: 'prefix'
  },
  {
    component: SetIdentity,
    actions: ['identity.'],
    matchType: 'prefix'
  }
];

const Call = forwardRef<HTMLDivElement | null, CallProps>((props, ref) => {
  const {
    registry,
    call,
    showFallback = false,
    fallbackComponent: FallbackComponent = FunctionArgs as CallComponent,
    ...restProps
  } = props;

  const action = useMemo(() => (call ? findAction(registry, call)?.join('.') : null), [call, registry]);
  const domRef = useRef<HTMLDivElement>(null);
  const currentRef = ref || domRef;

  // Track the render state of the current ref
  const renderState = useRefState(currentRef);

  // Find matching component
  const Component = useMemo(() => {
    if (!action) return null;

    for (const config of componentDef) {
      const isMatch =
        config.matchType === 'exact'
          ? config.actions.includes(action)
          : config.actions.some((actionPattern) => action.startsWith(actionPattern));

      if (isMatch) {
        return config.component;
      }
    }

    return null;
  }, [action]);

  if (!action) {
    return null;
  }

  // If we have a matched component, render it with render state detection
  return (
    <>
      {Component ? <Component ref={currentRef} {...props} /> : null}

      {(!Component || renderState === 'empty') && showFallback ? (
        <FallbackComponent ref={!Component ? currentRef : undefined} registry={registry} call={call} {...restProps} />
      ) : null}
    </>
  );
});

Call.displayName = 'Call';

export default React.memo(Call);
