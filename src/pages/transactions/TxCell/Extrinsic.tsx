// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Codec, IMethod, TypeDef } from '@polkadot/types/types';

import { alpha, Box, Button, Chip, Divider, Stack, SvgIcon, Typography } from '@mui/material';
import { ApiPromise } from '@polkadot/api';
import { getTypeDef } from '@polkadot/types';
import { addressEq } from '@polkadot/util-crypto';
import React, { useCallback, useMemo } from 'react';

import { ReactComponent as ArrowDown } from '@mimirdev/assets/svg/ArrowDown.svg';
import { AddressRow } from '@mimirdev/components';
import { useApi, useToggle, useTxQueue } from '@mimirdev/hooks';
import { CalldataStatus, Transaction } from '@mimirdev/hooks/types';
import Params from '@mimirdev/params';
import Item from '@mimirdev/params/Param/Item';
import { getAddressMeta } from '@mimirdev/utils';

import { useInitTransaction } from '../useInitTransaction';
import CallDetail from './CallDetail';

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

function extractState(api: ApiPromise, value: IMethod): Extracted {
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

function extraFiltered(transaction: Transaction): Record<string, string[]> {
  const queue = [transaction];
  const filtered: Record<string, string[]> = {};

  while (queue.length > 0) {
    const node: Transaction = queue.shift() as Transaction;

    const meta = getAddressMeta(node.sender);

    if (!meta.isMultisig) continue;

    const list = meta.isFlexible ? node.children.at(0)?.children || [] : node.children;

    // find has not complete transaction (status = 0 | 1)
    const nocomplete = list.filter((item) => item.status < CalldataStatus.Success && getAddressMeta(item.sender).isMultisig);

    if (nocomplete.length > 0 && list.filter((item) => item.status === CalldataStatus.Success).length === 0) {
      filtered[node.sender] = [nocomplete[0].sender];
      queue.push(nocomplete[0]);
      continue;
    }

    for (const item of list) {
      const _meta = getAddressMeta(item.sender);

      if (node.status < CalldataStatus.Success) {
        if (filtered[node.sender]) {
          filtered[node.sender] = filtered[node.sender].filter((address) => (item.status === CalldataStatus.Success ? !addressEq(address, item.sender) : true));
        } else {
          filtered[node.sender] = (meta.who || []).filter((address) => (item.status === CalldataStatus.Success ? !addressEq(address, item.sender) : true));
        }
      } else if (node.status > CalldataStatus.Success) {
        filtered[node.sender] = meta.who || [];
      } else {
        filtered[node.sender] = [];
      }

      if (_meta.isMultisig) {
        queue.push(item);
      }
    }
  }

  return filtered;
}

function Extrinsic({ transaction }: { transaction: Transaction }) {
  const { api } = useApi();
  const { params, values } = useMemo(() => extractState(api, transaction.call), [api, transaction]);
  const [detailOpen, toggleDetailOpen] = useToggle();
  const { addQueue } = useTxQueue();
  const initTx = useInitTransaction(transaction);
  const status = transaction.status;

  const handleApprove = useCallback(() => {
    addQueue({
      filtered: extraFiltered(transaction),
      extrinsic: api.tx[transaction.call.section][transaction.call.method](...transaction.call.args),
      accountId: transaction.sender
    });
  }, [addQueue, api, transaction]);

  return (
    <Stack flex='1' spacing={1}>
      <Stack alignItems='center' direction='row' justifyContent='space-between'>
        <Stack alignItems='center' direction='row' spacing={1.25}>
          <Box sx={{ width: 8, height: 8, borderRadius: 1, bgcolor: status < CalldataStatus.Success ? 'warning.main' : status === CalldataStatus.Success ? 'success.main' : 'error.main' }} />
          <Typography color='primary.main' fontWeight={700} variant='h4'>
            No {initTx?.height}-{initTx?.index}
          </Typography>
          <Chip color='secondary' label={transaction.action} variant='filled' />
        </Stack>
      </Stack>
      <Divider />
      <Stack spacing={1} sx={{ lineHeight: 1.5 }}>
        <Item content={<AddressRow shorten={false} size='small' value={transaction.sender} withAddress withCopy withName={false} />} name='From' type='tx' />
        <Params params={params} registry={api.registry} type='tx' values={values} />
      </Stack>
      {detailOpen ? (
        <CallDetail call={transaction.call} depositor={initTx?.sender} />
      ) : (
        <Button
          color='secondary'
          endIcon={<SvgIcon component={ArrowDown} inheritViewBox sx={{ fontSize: '0.6rem !important' }} />}
          fullWidth
          onClick={toggleDetailOpen}
          sx={({ palette }) => ({ opacity: 0.9, color: alpha(palette.secondary.contrastText, 0.5) })}
          variant='contained'
        >
          Detail
        </Button>
      )}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button onClick={handleApprove} variant='outlined'>
          Approve
        </Button>
      </Box>
    </Stack>
  );
}

export default React.memo(Extrinsic);
