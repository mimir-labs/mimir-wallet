// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { Call, Extrinsic } from '@polkadot/types/interfaces';
import type { ExtrinsicPayloadValue, IMethod, ISubmittableResult } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';
import type { Filtered } from '@mimir-wallet/hooks/ctx/types';
import type { SafetyLevel, Transaction } from '@mimir-wallet/hooks/types';

import {
  Alert,
  Box,
  Button,
  Checkbox,
  DialogActions,
  DialogContent,
  Divider,
  FormControlLabel,
  Paper,
  Stack,
  SvgIcon,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { u8aToHex } from '@polkadot/util';
import { decodeAddress } from '@polkadot/util-crypto';
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import Logo from '@mimir-wallet/assets/images/logo.png';
import IconFailed from '@mimir-wallet/assets/svg/icon-failed-fill.svg?react';
import IconInfo from '@mimir-wallet/assets/svg/icon-info-fill.svg?react';
import IconSuccess from '@mimir-wallet/assets/svg/icon-success.svg?react';
import { useAddressMeta, useApi, usePendingTransactions, useToggle } from '@mimir-wallet/hooks';
import { canSendMultisig, type PrepareMultisig, prepareMultisig, service } from '@mimir-wallet/utils';

import AddressCell from '../AddressCell';
import AddressName from '../AddressName';
import FormatBalance from '../FormatBalance';
import Input from '../Input';
import LockItem, { LockContainer } from '../LockItem';
import AddressChain from './AddressChain';
import CallComp from './Call';
import SendTx from './SendTx';

function Contents({
  accounts: propsAccounts,
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
  accounts?: [string, ...string[]];
  isCancelled: boolean;
  onSignature?: (signer: string, signature: HexString, ex: Extrinsic, payload: ExtrinsicPayloadValue) => void;
  onError: (error: unknown) => void;
  onClose: () => void;
  onReject: () => void;
}) {
  const [accounts, setAccounts] = useState<[string, ...string[]]>(propsAccounts || [address]);
  const { api } = useApi();
  const [prepare, setPrepare] = useState<PrepareMultisig>();
  const canSend = useMemo(() => canSendMultisig(accounts), [accounts]);
  const [_pendingTxs] = usePendingTransactions(isApprove || isCancelled ? null : address);
  const pendingTxs = _pendingTxs.filter((item) => item.hash === extrinsic.method.hash.toHex());
  const { breakpoints } = useTheme();
  const [note, setNote] = useState<string>();
  const { meta } = useAddressMeta();
  const downSm = useMediaQuery(breakpoints.down('sm'));
  const [isConfirm, , setConfirm] = useToggle(false);
  const [safetyCheck, setSafetyCheck] = useState<SafetyLevel>();

  useEffect(() => {
    service.safetyCheck(u8aToHex(decodeAddress(destSender)), destCall.toHex()).then((level) => {
      if (level.severity === 'none') {
        setConfirm(true);
      }

      setSafetyCheck(level);
    });
  }, [destCall, destSender, setConfirm]);

  useEffect(() => {
    let unsubPromise: Promise<() => void> | undefined;

    if (canSend) {
      unsubPromise = api.rpc.chain.subscribeFinalizedHeads(() => {
        prepareMultisig(api, extrinsic, accounts, isCancelled).then((value) =>
          setPrepare((lastValue) => {
            if (JSON.stringify(value) !== JSON.stringify(lastValue)) {
              return value;
            }

            return lastValue;
          })
        );
      });
    }

    return () => {
      unsubPromise?.then((unsub) => unsub());
    };
  }, [accounts, api, canSend, isCancelled, extrinsic]);

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
          <CallComp
            destSender={destSender}
            isCancelled={isCancelled}
            method={destCall || extrinsic.method}
            sender={address}
            transaction={transaction}
          />

          {safetyCheck && (
            <Paper
              sx={{
                padding: 1.25,
                bgcolor: 'secondary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2
              }}
            >
              <Box>
                <Typography sx={{ mb: 1, fontSize: '0.875rem' }} variant='h6'>
                  {safetyCheck.title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                  Power by
                  <Box component='img' src={Logo} sx={{ height: 12 }} />
                </Box>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  color:
                    safetyCheck.severity === 'none'
                      ? 'primary.main'
                      : safetyCheck.severity === 'error'
                        ? 'error.main'
                        : 'warning.main'
                }}
              >
                {safetyCheck.severity === 'none' && <SvgIcon component={IconSuccess} inheritViewBox />}
                {safetyCheck.severity === 'error' && <SvgIcon component={IconFailed} inheritViewBox />}
                {safetyCheck.severity === 'warning' && <SvgIcon component={IconInfo} inheritViewBox />}
                <Typography>{safetyCheck.message}</Typography>
              </Box>
            </Paper>
          )}

          <AddressChain accounts={accounts} filtered={filtered} onChange={setAccounts} />
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
          {meta?.isMultisig && !isApprove && (
            <>
              <Divider />
              <Input label='Note' onChange={setNote} placeholder='Please note' />
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
        <Box sx={{ marginLeft: '0px !important', width: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
          {safetyCheck && safetyCheck.severity === 'warning' && (
            <FormControlLabel
              control={<Checkbox checked={isConfirm} onChange={(e) => setConfirm(e.target.checked)} />}
              label='I confirm recipient address exsits on the destination chain.'
            />
          )}

          <Box sx={{ display: 'flex', gap: 1 }}>
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
              disabled={
                pendingTxs.length > 0 ||
                (safetyCheck
                  ? safetyCheck.severity === 'none'
                    ? false
                    : safetyCheck.severity === 'error'
                      ? true
                      : !isConfirm
                  : true)
              }
              note={note}
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
        </Box>
      </DialogActions>
    </>
  );
}

export default React.memo(Contents);
