// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { Call } from '@polkadot/types/interfaces';
import type { Codec, IMethod, TypeDef } from '@polkadot/types/types';
import type { ParamType } from './types';

import { Box, Typography } from '@mui/material';
import { getTypeDef } from '@polkadot/types';
import React, { useMemo } from 'react';

import { AddressRow } from '@mimirdev/components';
import { useAddressMeta } from '@mimirdev/hooks';

import Item from './Param/Item';
import Param from './Param';
import Params from './Params';

interface Param {
  name: string;
  type: TypeDef;
}

interface Value {
  isValid: boolean;
  value: Codec;
}

interface Extracted {
  params: Param[];
  values: Value[];
}

interface Props {
  call: Call | IMethod;
  api: ApiPromise;
  type?: ParamType;
}

export function extractState(value: IMethod): Extracted {
  const params = value.meta.args.map(
    ({ name, type }): Param => ({
      name: name.toString(),
      type: getTypeDef(type.toString())
    })
  );
  const values = value.args.map(
    (value): Value => ({
      isValid: true,
      value
    })
  );

  return {
    params,
    values
  };
}

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

function ChangeMember({ changes, type = 'base' }: Props & { changes: [string, string] }) {
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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

function Call({ api, call, type }: Props) {
  const { params, values } = useMemo(() => extractState(call), [call]);

  const changes = useMemo(() => matchChangeMember(api, call), [api, call]);

  return changes ? <ChangeMember api={api} call={call} changes={changes} type={type} /> : <Params params={params} registry={api.registry} type={type} values={values} />;
}

export default React.memo(Call);
