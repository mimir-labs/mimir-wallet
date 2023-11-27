// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Multisig } from '@polkadot/types/interfaces';
import type { Codec, IMethod, TypeDef } from '@polkadot/types/types';
import type { Filtered } from '@mimirdev/hooks/ctx/types';

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

import { useMultisigInfo } from '../useMultisigInfo';
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

function extraFiltered(address: string, filtered: Filtered = {}): Filtered {
  const meta = getAddressMeta(address);

  if (meta.isMultisig) {
    meta.who?.forEach((address) => {
      filtered[address] = {};

      extraFiltered(address, filtered[address]);
    });
  }

  return filtered;
}

function removeSuccessFiltered(transaction: Transaction, filtered: Filtered): void {
  const address = transaction.sender;
  const meta = getAddressMeta(address);

  (meta.isFlexible ? transaction.children[0] : transaction).children.forEach((tx) => {
    const _filtered = filtered[tx.sender];

    if (_filtered) {
      if (tx.status === CalldataStatus.Success) {
        delete filtered[tx.sender];
      }

      removeSuccessFiltered(tx, _filtered);
    }
  });
}

function removeMultisigDeepFiltered(transaction: Transaction, filtered: Filtered): void {
  const address = transaction.sender;
  const meta = getAddressMeta(address);

  transaction = meta.isFlexible ? transaction.children[0] : transaction;

  if (transaction.status === CalldataStatus.Initialized) {
    // when transaction status is Initialized, means the transaction is not on chain
    // remove the account is not multisig from filtered
    Object.keys(filtered).forEach((_address) => {
      const _meta = getAddressMeta(_address);

      if (!_meta.isMultisig) {
        delete filtered[_address];
      }
    });
  }

  transaction.children.forEach((tx) => {
    const _filtered = filtered[tx.sender];

    if (_filtered) {
      removeMultisigDeepFiltered(tx, _filtered);
    }
  });
}

function Extrinsic({ transaction }: { transaction: Transaction }) {
  const destTx = transaction.top || transaction;
  const { api } = useApi();
  const { params, values } = useMemo(() => extractState(api, destTx.call), [api, destTx]);
  const [detailOpen, toggleDetailOpen] = useToggle();
  const { addQueue } = useTxQueue();
  const status = transaction.status;
  const info = useMultisigInfo(api, transaction);

  const handleApprove = useCallback(() => {
    const filtered = extraFiltered(transaction.sender);

    removeSuccessFiltered(transaction, filtered);
    removeMultisigDeepFiltered(transaction, filtered);

    addQueue({
      filtered,
      extrinsic: api.tx[transaction.call.section][transaction.call.method](...transaction.call.args),
      accountId: transaction.sender,
      isApprove: true
    });
  }, [addQueue, api, transaction]);

  const handleCancel = useCallback(
    (info: Multisig) => {
      const filtered = extraFiltered(transaction.sender);

      Object.keys(filtered).forEach((key) => {
        if (!addressEq(key, info.depositor)) {
          delete filtered[key];
        }
      });

      addQueue({
        filtered,
        extrinsic: api.tx[transaction.call.section][transaction.call.method](...transaction.call.args),
        accountId: transaction.sender,
        isCancelled: true
      });
    },
    [addQueue, api, transaction]
  );

  return (
    <Stack flex='1' spacing={1}>
      <Stack alignItems='center' direction='row' justifyContent='space-between'>
        <Stack alignItems='center' direction='row' spacing={1.25}>
          <Box sx={{ width: 8, height: 8, borderRadius: 1, bgcolor: status < CalldataStatus.Success ? 'warning.main' : status === CalldataStatus.Success ? 'success.main' : 'error.main' }} />
          <Typography color='primary.main' fontWeight={700} variant='h4'>
            No {destTx.uuid.slice(0, 8).toUpperCase()}
          </Typography>
          <Chip color='secondary' label={destTx.action} variant='filled' />
        </Stack>
      </Stack>
      <Divider />
      <Stack spacing={1} sx={{ lineHeight: 1.5 }}>
        {destTx !== transaction && (
          <Item content={<AddressRow defaultName={destTx.sender} shorten={false} size='small' value={destTx.sender} withAddress={false} withCopy withName />} name='From' type='tx' />
        )}
        <Params params={params} registry={api.registry} type='tx' values={values} />
      </Stack>
      {detailOpen ? (
        <CallDetail call={transaction.call} depositor={transaction.initTransaction.sender} />
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
      {transaction.status < CalldataStatus.Success && (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button onClick={handleApprove} variant='outlined'>
            Approve
          </Button>
          {info && (
            <Button onClick={() => handleCancel(info)} variant='outlined'>
              Cancel
            </Button>
          )}
        </Box>
      )}
    </Stack>
  );
}

export default React.memo(Extrinsic);
