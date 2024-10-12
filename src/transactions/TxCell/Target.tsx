// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { IMethod } from '@polkadot/types/types';

import { Alert, AlertTitle } from '@mui/material';
import { createKeyMulti } from '@polkadot/util-crypto';
import React, { useMemo } from 'react';

import { encodeAddress } from '@mimir-wallet/api';
import { AddressRow } from '@mimir-wallet/components';
import { useApi } from '@mimir-wallet/hooks';
import { Call as CallComp } from '@mimir-wallet/params';

import { Item } from './Extrinsic';

function findTargetCall(api: ApiPromise, address: string, call?: IMethod | null): [string, IMethod | null | undefined] {
  if (!call) {
    return [address, call];
  }

  if (api.tx.proxy.proxy.is(call)) {
    return findTargetCall(api, call.args[0].toString(), call.args[2]);
  }

  if (api.tx.proxy.proxyAnnounced.is(call)) {
    return findTargetCall(api, call.args[1].toString(), call.args[3]);
  }

  if (api.tx.proxy.announce.is(call)) {
    return findTargetCall(api, call.args[0].toString(), null);
  }

  if (api.tx.multisig.asMulti.is(call)) {
    return findTargetCall(api, encodeAddress(createKeyMulti(call.args[1], call.args[0])), call.args[3]);
  }

  if (api.tx.multisig.asMultiThreshold1.is(call)) {
    return findTargetCall(api, encodeAddress(createKeyMulti(call.args[0], 1)), call.args[1]);
  }

  if (api.tx.multisig.approveAsMulti.is(call)) {
    return findTargetCall(api, encodeAddress(createKeyMulti(call.args[1], call.args[0])), null);
  }

  return [address, call];
}

function Target({ call, address }: { address: string; call?: IMethod | null }) {
  const { api } = useApi();
  const [from, targetCall] = useMemo(() => findTargetCall(api, address, call), [address, api, call]);

  if (!call) {
    return null;
  }

  return (
    <>
      {targetCall ? <CallComp from={from} api={api} call={targetCall} jsonFallback /> : null}
      {!call && (
        <Alert severity='warning'>
          <AlertTitle>Warning</AlertTitle>
          This transaction wasn’t initiated from Mimir. Please confirm the security of this transaction.
        </Alert>
      )}
      <Item title='From' content={<AddressRow size='small' withCopy value={from} />} />
    </>
  );
}

export default React.memo(Target);
