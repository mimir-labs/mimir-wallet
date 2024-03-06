// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Filtered } from '@mimir-wallet/hooks/ctx/types';
import type { Transaction } from '@mimir-wallet/hooks/types';
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { Call, Extrinsic } from '@polkadot/types/interfaces';
import type { ExtrinsicPayloadValue, IMethod, ISubmittableResult } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';

import { useApi, usePendingTransactions } from '@mimir-wallet/hooks';
import { canSendMultisig, PrepareMultisig, prepareMultisig } from '@mimir-wallet/utils';
import { Alert, Box, Button, DialogActions, DialogContent, Divider, Paper, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import AddressCell from '../AddressCell';
import AddressName from '../AddressName';
import FormatBalance from '../FormatBalance';
import LockItem, { LockContainer } from '../LockItem';
import AddressChain from './AddressChain';
import CallComp from './Call';
import SendTx from './SendTx';

function Contents({
  accounts: propsAccounts = {},
  address,
  beforeSend,
  destCall,
  destSender,
  extrinsic,
  filtered,
  isApprove,
  isCancelled,
  onClose,
  onError,
  onFinalized,
  onReject,
  onResults,
  onSignature,
  onlySign,
  transaction,
  website
}: {
  beforeSend: () => Promise<void>;
  address: string;
  destCall: Call | IMethod;
  destSender: string;
  extrinsic: SubmittableExtrinsic<'promise'>;
  transaction?: Transaction;
  onResults?: (results: ISubmittableResult) => void;
  onFinalized?: (results: ISubmittableResult) => void;
  filtered?: Filtered;
  isApprove: boolean;
  onlySign: boolean;
  website?: string;
  accounts?: Record<string, string | undefined>;
  isCancelled: boolean;
  onSignature?: (signer: string, signature: HexString, ex: Extrinsic, payload: ExtrinsicPayloadValue) => void;
  onError: (error: unknown) => void;
  onClose: () => void;
  onReject: () => void;
}) {
  const [accounts, setAccounts] = useState<Record<string, string | undefined>>(propsAccounts);
  const { api } = useApi();
  const [prepare, setPrepare] = useState<PrepareMultisig>();
  const canSend = useMemo(() => canSendMultisig(accounts, address), [accounts, address]);
  const [_pendingTxs] = usePendingTransactions(isApprove || isCancelled ? null : address);
  const pendingTxs = _pendingTxs.filter((item) => item.hash === extrinsic.method.hash.toHex());
  const { breakpoints } = useTheme();
  const downSm = useMediaQuery(breakpoints.down('sm'));

  useEffect(() => {
    let unsubPromise: Promise<() => void> | undefined;

    if (canSend) {
      unsubPromise = api.rpc.chain.subscribeFinalizedHeads(() => {
        prepareMultisig(api, extrinsic, accounts, address, isCancelled).then((value) =>
          setPrepare((lastValue) => {
            if (JSON.stringify(value) !== JSON.stringify(lastValue)) {
              return value;
            } else {
              return lastValue;
            }
          })
        );
      });
    }

    return () => {
      unsubPromise?.then((unsub) => unsub());
    };
  }, [accounts, address, api, canSend, isCancelled, extrinsic]);

  return (
    <>
      <DialogContent>
        <Stack spacing={2}>
          <Box>
            <Typography fontWeight={700} mb={1}>
              Sending From
            </Typography>
            <Paper sx={{ bgcolor: 'secondary.main', padding: 1 }}>
              <AddressCell shorten={downSm} size='small' value={address} withCopy />
            </Paper>
          </Box>
          {website && (
            <Box>
              <Typography fontWeight={700} mb={1}>
                Website
              </Typography>
              <Typography color='primary.main'>{website}</Typography>
            </Box>
          )}
          <Divider />
          <CallComp destSender={destSender} isCancelled={isCancelled} method={destCall || extrinsic.method} sender={address} transaction={transaction} />
          <AddressChain accounts={accounts} address={address} filtered={filtered} onChange={setAccounts} />
          {prepare && (!!Object.keys(prepare[2]).length || !!Object.keys(prepare[3]).length) && (
            <>
              <Divider />
              <LockContainer>
                {Object.entries(prepare[2]).map(([address, value], index) => (
                  <LockItem
                    address={address}
                    key={index}
                    tip={
                      <>
                        <FormatBalance value={value} /> in{' '}
                        <b>
                          <AddressName value={address} />
                        </b>{' '}
                        will be reserved for initiate transaction.
                      </>
                    }
                    value={value}
                  />
                ))}
                {Object.entries(prepare[3]).map(([address, value], index) => (
                  <LockItem
                    address={address}
                    isUnLock
                    key={index}
                    tip={
                      <>
                        <FormatBalance value={value} /> in{' '}
                        <b>
                          <AddressName value={address} />
                        </b>{' '}
                        will be unreserved for execute transaction.
                      </>
                    }
                    value={value}
                  />
                ))}
              </LockContainer>
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ flexDirection: 'column', gap: 1, alignItems: 'start' }}>
        {pendingTxs.length > 0 && (
          <Alert severity='error' sx={{ width: '100%' }}>
            This transaction has already been initiated as{' '}
            <Link
              onClick={onClose}
              to={{
                pathname: '/transactions',
                hash: pendingTxs[0].uuid
              }}
            >
              No.{pendingTxs[0].uuid.slice(0, 8).toUpperCase()}
            </Link>
            .
          </Alert>
        )}
        <Box sx={{ marginLeft: '0px !important', width: '100%', display: 'flex', gap: 1 }}>
          <Button
            fullWidth
            onClick={() => {
              onClose();
              onReject();
            }}
            variant='outlined'
          >
            Cancel
          </Button>
          <SendTx
            beforeSend={beforeSend}
            canSend={canSend}
            disabled={pendingTxs.length > 0}
            onClose={onClose}
            onError={onError}
            onFinalized={onFinalized}
            onResults={onResults}
            onSignature={onSignature}
            onlySign={onlySign}
            prepare={prepare}
            website={website}
          />
        </Box>
      </DialogActions>
    </>
  );
}

export default React.memo(Contents);
