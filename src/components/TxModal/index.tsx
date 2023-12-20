// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Filtered } from '@mimir-wallet/hooks/ctx/types';
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { Call, Extrinsic } from '@polkadot/types/interfaces';
import type { ExtrinsicPayloadValue, IMethod, ISubmittableResult } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';

import { useApi, useTxQueue } from '@mimir-wallet/hooks';
import { SelectAccountCtx } from '@mimir-wallet/hooks/ctx/SelectedAccount';
import { CalldataStatus, Transaction } from '@mimir-wallet/hooks/types';
import { canSendMultisig, PrepareMultisig, prepareMultisig } from '@mimir-wallet/utils';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Paper, Stack, Typography } from '@mui/material';
import { useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import AddressCell from '../AddressCell';
import AddressName from '../AddressName';
import FormatBalance from '../FormatBalance';
import LockItem, { LockContainer } from '../LockItem';
import AddressChain from './AddressChain';
import CallComp from './Call';
import SendTx from './SendTx';

function Contents({
  address,
  beforeSend,
  destCall,
  destSender,
  extrinsic,
  filtered,
  isApprove,
  isCancelled,
  onClose,
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
  filtered?: Filtered;
  isApprove: boolean;
  onlySign: boolean;
  website?: string;
  isCancelled: boolean;
  onSignature?: (signer: string, signature: HexString, ex: Extrinsic, payload: ExtrinsicPayloadValue) => void;
  onClose: () => void;
  onReject: () => void;
}) {
  const [accounts, setAccounts] = useState<Record<string, string | undefined>>({});
  const { api } = useApi();
  const [prepare, setPrepare] = useState<PrepareMultisig>();
  const canSend = useMemo(() => canSendMultisig(accounts, address), [accounts, address]);
  const { transactions } = useContext(SelectAccountCtx);
  const txs = useMemo(() => (!isApprove && !isCancelled ? transactions : []), [isApprove, isCancelled, transactions]);
  const pendingTxs = useMemo(() => txs.filter((item) => item.status < CalldataStatus.Success && item.call.hash.toHex() === extrinsic.method.hash.toHex()), [extrinsic.method.hash, txs]);

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
              <AddressCell shorten={false} size='small' value={address} withCopy />
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
          <Divider />
          <AddressChain accounts={accounts} address={address} filtered={filtered} onChange={setAccounts} />
          {prepare && (!!Object.keys(prepare[2]).length || !!Object.keys(prepare[3]).length) && (
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
          <SendTx beforeSend={beforeSend} canSend={canSend} disabled={pendingTxs.length > 0} onClose={onClose} onResults={onResults} onSignature={onSignature} onlySign={onlySign} prepare={prepare} />
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
        </Box>
      </DialogActions>
    </>
  );
}

function TxModal() {
  const { isApiReady } = useApi();
  const { queue } = useTxQueue();

  return isApiReady ? (
    queue.map(({ accountId, beforeSend, destCall, destSender, extrinsic, filtered, id, isApprove, isCancelled, onReject, onRemove, onResults, onSignature, onlySign, transaction, website }) => (
      <Dialog
        fullWidth
        key={id}
        maxWidth='sm'
        onClose={() => {
          onRemove();
          onReject();
        }}
        open={true}
      >
        <DialogTitle>Submit Transaction</DialogTitle>
        {isApiReady && (
          <Contents
            address={accountId.toString()}
            beforeSend={beforeSend}
            destCall={destCall}
            destSender={destSender.toString()}
            extrinsic={extrinsic}
            filtered={filtered}
            isApprove={isApprove}
            isCancelled={isCancelled}
            onClose={onRemove}
            onReject={onReject}
            onResults={onResults}
            onSignature={onSignature}
            onlySign={onlySign}
            transaction={transaction}
            website={website}
          />
        )}
      </Dialog>
    ))
  ) : (
    <></>
  );
}

export default TxModal;
