// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { AccountId, Address, Extrinsic } from '@polkadot/types/interfaces';
import type { ExtrinsicPayloadValue, IMethod, ISubmittableResult } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';
import type { FilterPath, Transaction } from '@mimir-wallet/hooks/types';

import { Box, Checkbox, Divider, FormControlLabel, IconButton, Paper, Stack, SvgIcon, Typography } from '@mui/material';
import { useState } from 'react';

import IconClose from '@mimir-wallet/assets/svg/icon-close.svg?react';
import { useFilterPaths, useQueryAccount, useWallet } from '@mimir-wallet/hooks';

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
  const { walletAccounts } = useWallet();
  const [account, setAccount] = useState<string | undefined>(accountId?.toString() || walletAccounts?.[0].address);
  const [safetyCheck, isConfirm, setConfirm] = useSafetyCheck(call);
  const [note, setNote] = useState<string>(transaction?.note || '');
  const accountData = useQueryAccount(account);
  const filterPaths = useFilterPaths(accountData, transaction);
  const [addressChain, setAddressChain] = useState<FilterPath[]>(propsFilterPaths || []);
  const { isLoading: isTxBundleLoading, txBundle } = useBuildTx(call, addressChain);

  useHighlightTab();
  useCloseWhenPathChange(onClose);

  return (
    <Box sx={{ width: '100%', padding: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
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
        sx={{
          width: '100%',
          height: 'calc(100dvh - 160px)',
          display: 'flex',
          padding: 2,
          gap: 2,
          overflowY: 'auto'
        }}
      >
        <Stack width='60%' spacing={2}>
          {account && <Sender address={account} />}

          <AppInfo
            website={transaction?.website || website}
            iconUrl={transaction?.iconUrl || iconUrl}
            appName={transaction?.appName || appName}
          />

          <Call account={account} method={call} transaction={transaction} />

          <SafetyCheck isTxBundleLoading={isTxBundleLoading} txBundle={txBundle} safetyCheck={safetyCheck} />
        </Stack>

        <Stack
          sx={({ shadows }) => ({
            position: 'sticky',
            top: 0,
            alignSelf: 'start',
            width: '40%',
            height: 'auto',
            padding: 2,
            borderRadius: 2,
            boxShadow: shadows[1]
          })}
          spacing={2}
        >
          {accountId ? (
            <AddressChain
              deep={0}
              filterPaths={filterPaths}
              addressChain={addressChain}
              setAddressChain={setAddressChain}
            />
          ) : (
            <InputAddress
              label='Select Signer'
              placeholder='Please select signer'
              value={account}
              onChange={setAccount}
              isSign
              filtered={walletAccounts.map((item) => item.address)}
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

          <SendTx
            account={account}
            call={call}
            disabled={!txBundle.canProxyExecute}
            filterPath={addressChain}
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
        </Stack>
      </Paper>
    </Box>
  );
}

export default TxSubmit;
