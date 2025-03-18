// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IMethod } from '@polkadot/types/types';

import { AddressRow } from '@/components';
import { Call as CallComp } from '@/params';
import { Alert, AlertTitle } from '@mui/material';
import React, { useMemo } from 'react';

import { findTargetCall, useApi } from '@mimir-wallet/polkadot-core';

import { Item } from './Extrinsic';

function Target({ call, address }: { address: string; call?: IMethod | null }) {
  const { api } = useApi();
  const [from, targetCall] = useMemo(() => findTargetCall(api, address, call), [address, api, call]);

  if (!call) {
    return null;
  }

  return (
    <>
      {targetCall ? <CallComp from={from} registry={api.registry} call={targetCall} jsonFallback /> : null}
      {!call && (
        <Alert severity='warning'>
          <AlertTitle>Warning</AlertTitle>
          This transaction wasn’t initiated from Mimir. Please confirm the security of this transaction.
        </Alert>
      )}
      <Item title='From' content={<AddressRow iconSize={20} withCopy value={from} />} />
    </>
  );
}

export default React.memo(Target);
