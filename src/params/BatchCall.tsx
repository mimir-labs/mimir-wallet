// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { Call } from '@polkadot/types/interfaces';
import type { IMethod } from '@polkadot/types/types';
import type { CallProps } from './types';

import { AddressRow } from '@mimir-wallet/components';
import { useAddressMeta } from '@mimir-wallet/hooks';
import { Box, Typography } from '@mui/material';
import React, { useMemo } from 'react';

import Item from './Param/Item';
import FallbackCall from './FallbackCall';

function matchChangeMember(api: ApiPromise, call: IMethod | Call): [string, string] | null {
  if (api.tx.utility.batchAll.is(call)) {
    if (call.args[0].length === 2) {
      const call0 = call.args[0][0];
      const call1 = call.args[0][1];

      if (api.tx.proxy.addProxy.is(call0) && api.tx.proxy.removeProxy.is(call1)) {
        return [call0.args[0].toString(), call1.args[0].toString()];
      }
    }
  }

  return null;
}

function ChangeMember({ changes, type = 'base' }: CallProps & { changes: [string, string] }) {
  const [newAddress, oldAddress] = changes;
  const { meta: newMeta } = useAddressMeta(newAddress);
  const { meta: oldMeta } = useAddressMeta(oldAddress);

  return (
    <>
      <Item
        content={
          <Typography>
            {oldMeta.threshold}
            {'->'}
            {newMeta.threshold}
          </Typography>
        }
        name='Threshold'
        type={type}
      />
      <Item
        content={
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            {newMeta.who?.map((address) => (
              <AddressRow key={address} size='small' value={address} withAddress={false} withCopy withName />
            ))}
          </Box>
        }
        name='New Members'
        type={type}
      />
    </>
  );
}

function BatchCall({ api, call, jsonFallback, type = 'base' }: CallProps) {
  const changes = useMemo(() => matchChangeMember(api, call), [api, call]);

  if (!changes) {
    return jsonFallback ? <FallbackCall call={call} /> : null;
  }

  return <ChangeMember api={api} call={call} changes={changes} type={type} />;
}

export default React.memo(BatchCall);
