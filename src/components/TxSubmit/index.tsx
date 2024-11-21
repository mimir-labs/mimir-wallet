// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { AccountId, Address, Extrinsic } from '@polkadot/types/interfaces';
import type { ExtrinsicPayloadValue, IMethod, ISubmittableResult } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';
import type { FilterPath, Transaction } from '@mimir-wallet/hooks/types';

import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  IconButton,
  Paper,
  Stack,
  SvgIcon,
  Typography
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';

import IconBatch from '@mimir-wallet/assets/svg/icon-batch.svg?react';
import IconClose from '@mimir-wallet/assets/svg/icon-close.svg?react';
import { useBatchTxs, useFilterPaths, useQueryAccount, useWallet } from '@mimir-wallet/hooks';

import Input from '../Input';
import InputAddress from '../InputAddress';
import { useBuildTx } from './hooks/useBuildTx';
import { useCloseWhenPathChange } from './hooks/useCloseWhenPathChange';
import { useHighlightTab } from './hooks/useHighlightTab';
import { useSafetyCheck } from './hooks/useSafetyCheck';
import AddressChain from './AddressChain';
import AppInfo from './AppInfo';
import Call from './Call';
import SafetyCheck from './SafetyCheck';
import Sender from './Sender';
import SendTx from './SendTx';

interface Props {
  accountId?: AccountId | Address | string;
  call: IMethod;
  transaction?: Transaction | null;
  filterPaths?: FilterPath[];
  onlySign?: boolean;
  website?: string;
  iconUrl?: string;
  appName?: string;
  onReject?: () => void;
  onClose?: () => void;
  onError?: (error: unknown) => void;
  onResults?: (results: ISubmittableResult) => void;
  onFinalized?: (results: ISubmittableResult) => void;
  onSignature?: (signer: string, signature: HexString, tx: Extrinsic, payload: ExtrinsicPayloadValue) => void;
  beforeSend?: (extrinsic: SubmittableExtrinsic<'promise'>) => Promise<void>;
}

function TxSubmit({
  accountId,
  call,
  transaction,
  onlySign,
  website,
  appName,
  iconUrl,
  filterPaths: propsFilterPaths,
  onReject,
  onClose,
  onResults,
  onFinalized,
  onError,
  onSignature,
  beforeSend
}: Props) {
  const { walletAccounts, accountSource } = useWallet();
  const [account, setAccount] = useState<string | undefined>(accountId?.toString() || walletAccounts?.[0].address);
  const [safetyCheck, isConfirm, setConfirm] = useSafetyCheck(call);
  const [note, setNote] = useState<string>(transaction?.note || '');
  const [accountData, isFetched] = useQueryAccount(account);
  const filterPaths = useFilterPaths(accountData, transaction);
  const [addressChain, setAddressChain] = useState<FilterPath[]>(propsFilterPaths || []);
  const [, addTx] = useBatchTxs(account);
  const buildTx = useBuildTx(call, addressChain, account, transaction);

  const handleAddBatch = useCallback(() => {
    addTx([
      {
        calldata: call.toHex(),
        website,
        iconUrl,
        appName
      }
    ]);
    onClose?.();
  }, [addTx, appName, call, iconUrl, onClose, website]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  useHighlightTab();
  useCloseWhenPathChange(onClose);

  return (
    <Box sx={{ width: '100%', padding: { sm: 2, xs: 1.5 } }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 2
        }}
      >
        <Typography variant='h4'>Submit Transaction</Typography>
        <IconButton
          color='inherit'
          onClick={() => {
            onClose?.();
            onReject?.();
          }}
        >
          <SvgIcon component={IconClose} inheritViewBox />
        </IconButton>
      </Box>

      <Paper
        sx={({ shadows }) => ({
          width: '100%',
          height: { md: 'calc(100dvh - 160px)', xs: 'auto' },
          display: 'flex',
          flexDirection: { md: 'row', xs: 'column' },
          padding: { md: 2, xs: 0 },
          gap: 2,
          overflowY: 'auto',
          bgcolor: { md: 'background.paper', xs: 'transparent' },
          boxShadow: { md: shadows[1], xs: shadows[0] }
        })}
      >
        <Stack
          width={{ md: '60%', xs: '100%' }}
          spacing={2}
          sx={({ shadows }) => ({
            padding: { md: 0, xs: 1.5 },
            boxShadow: { md: shadows[0], xs: shadows[1] },
            bgcolor: { md: 'transparent', xs: 'background.paper' },
            borderRadius: 2
          })}
        >
          {account && <Sender address={account} />}

          <AppInfo
            website={transaction?.website || website}
            iconUrl={transaction?.iconUrl || iconUrl}
            appName={transaction?.appName || appName}
          />

          <Call account={account} method={call} transaction={transaction} />

          <SafetyCheck
            isTxBundleLoading={buildTx.isLoading}
            call={call}
            account={account}
            txError={buildTx.error}
            safetyCheck={safetyCheck}
          />
        </Stack>

        <Stack
          sx={({ shadows }) => ({
            position: 'sticky',
            top: 0,
            alignSelf: 'start',
            width: { md: '40%', xs: '100%' },
            height: 'auto',
            padding: { sm: 2, xs: 1.5 },
            borderRadius: 2,
            boxShadow: shadows[1],
            bgcolor: { md: 'transparent', xs: 'background.paper' }
          })}
          spacing={2}
        >
          {!accountId || !!accountSource(accountId.toString()) ? (
            <InputAddress
              label='Select Signer'
              placeholder='Please select signer'
              value={account}
              onChange={setAccount}
              isSign
              filtered={accountId ? [accountId.toString()] : walletAccounts.map((item) => item.address)}
            />
          ) : (
            <AddressChain
              deep={0}
              filterPaths={filterPaths}
              addressChain={addressChain}
              setAddressChain={setAddressChain}
            />
          )}

          <Input label='Note(Optional)' onChange={setNote} value={note} placeholder='Please note' />

          <Divider />

          {safetyCheck && safetyCheck.severity === 'warning' && (
            <FormControlLabel
              control={<Checkbox checked={isConfirm} onChange={(e) => setConfirm(e.target.checked)} />}
              label='I confirm recipient address exsits on the destination chain.'
            />
          )}

          {isFetched && (
            <SendTx
              disabled={
                !safetyCheck || safetyCheck.severity === 'error' || (safetyCheck.severity === 'warning' && !isConfirm)
              }
              buildTx={buildTx}
              note={note}
              onlySign={onlySign}
              website={transaction?.website || website}
              iconUrl={transaction?.iconUrl || iconUrl}
              appName={transaction?.appName || appName}
              onError={onError}
              onFinalized={onFinalized}
              onResults={(...args) => {
                onClose?.();
                onResults?.(...args);
              }}
              onSignature={(...args) => {
                onClose?.();
                onSignature?.(...args);
              }}
              beforeSend={beforeSend}
            />
          )}

          {!transaction && (
            <Button
              fullWidth
              onClick={handleAddBatch}
              color='primary'
              variant='outlined'
              startIcon={<SvgIcon component={IconBatch} inheritViewBox />}
            >
              Add To Cache
            </Button>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}

export default TxSubmit;
