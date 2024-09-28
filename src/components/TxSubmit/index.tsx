// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId, Address, Extrinsic } from '@polkadot/types/interfaces';
import type { ExtrinsicPayloadValue, IMethod, ISubmittableResult } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';
import type { FilterPath, Transaction } from '@mimir-wallet/hooks/types';

import { Box, Checkbox, Divider, FormControlLabel, IconButton, Paper, Stack, SvgIcon, Typography } from '@mui/material';
import { useState } from 'react';

import IconClose from '@mimir-wallet/assets/svg/icon-close.svg?react';
import { useFilterPaths, useQueryAccount } from '@mimir-wallet/hooks';

import Input from '../Input';
import AddressChain from './AddressChain';
import AppInfo from './AppInfo';
import Call from './Call';
import SafetyCheck from './SafetyCheck';
import Sender from './Sender';
import SendTx from './SendTx';
import { useSafetyCheck } from './useSafetyCheck';

interface Props {
  accountId: AccountId | Address | string;
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
  beforeSend?: () => Promise<void>;
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
  const account = accountId.toString();
  const [safetyCheck, isConfirm, setConfirm] = useSafetyCheck(account, call);
  const [note, setNote] = useState<string>();
  const accountData = useQueryAccount(account);
  const filterPaths = useFilterPaths(accountData, transaction);
  const [addressChain, setAddressChain] = useState<FilterPath[]>(propsFilterPaths || []);

  return (
    <Box sx={{ width: '100%' }}>
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
          <Sender address={account} />

          <AppInfo
            website={website || transaction?.website}
            iconUrl={iconUrl || transaction?.iconUrl}
            appName={appName || transaction?.appName}
          />

          <Call account={account} method={call} />

          <SafetyCheck safetyCheck={safetyCheck} />
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
          <AddressChain
            deep={0}
            filterPaths={filterPaths}
            addressChain={addressChain}
            setAddressChain={setAddressChain}
          />

          <Input multiline rows={6} label='Note' onChange={setNote} placeholder='Please note' />

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
            filterPath={addressChain}
            note={note}
            onlySign={onlySign}
            website={website}
            iconUrl={iconUrl}
            appName={appName}
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
