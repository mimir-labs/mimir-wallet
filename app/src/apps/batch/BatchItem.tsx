// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Registry } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';

import React from 'react';
import { useToggle } from 'react-use';

import BatchItemBase from './BatchItemBase';

interface Props {
  children: React.ReactNode;
  actions?: React.ReactNode;
  calldata: HexString;
  registry: Registry;
  from: string;
  bgcolor?: string;
}

function BatchItem({ children, actions, from, calldata, bgcolor, registry }: Props) {
  const [isOpen, toggleOpen] = useToggle(false);

  return (
    <BatchItemBase
      calldata={calldata}
      registry={registry}
      from={from}
      bgcolor={bgcolor}
      isOpen={isOpen}
      onToggle={toggleOpen}
      actions={actions}
    >
      {children}
    </BatchItemBase>
  );
}

export default React.memo(BatchItem);
