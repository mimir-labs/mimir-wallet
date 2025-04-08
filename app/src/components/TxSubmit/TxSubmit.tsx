// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountData, FilterPath } from '@/hooks/types';
import type { TxSubmitProps } from './types';

import { useAccount } from '@/accounts/useAccount';
import IconBatch from '@/assets/svg/icon-batch.svg?react';
import IconClose from '@/assets/svg/icon-close.svg?react';
import IconTemplate from '@/assets/svg/icon-template.svg?react';
import { events } from '@/events';
import { useBatchTxs } from '@/hooks/useBatchTxs';
import { useFilterPaths } from '@/hooks/useFilterPaths';
import { Divider, IconButton, Paper, Stack, SvgIcon, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useApi } from '@mimir-wallet/polkadot-core';
import { Alert, Button, Checkbox } from '@mimir-wallet/ui';

import Input from '../Input';
import { useBuildTx } from './hooks/useBuildTx';
import { useCloseWhenPathChange } from './hooks/useCloseWhenPathChange';
import { useHighlightTab } from './hooks/useHighlightTab';
import { useSafetyCheck } from './hooks/useSafetyCheck';
import AddressChain from './AddressChain';
import AppInfo from './AppInfo';
import Call from './Call';
import ProposeTx from './ProposeTx';
import SafetyCheck from './SafetyCheck';
import Sender from './Sender';
import SendTx from './SendTx';

interface Props extends Omit<TxSubmitProps, 'accountId'> {
  accountData: AccountData;
}

function TxSubmit({
  accountData,
  call,
  transaction,
  onlySign,
  website,
  appName,
  iconUrl,
  relatedBatches,
  filterPaths: propsFilterPaths,
  onReject,
  onClose,
  onResults,
  onFinalized,
  onError,
  onSignature,
  beforeSend
}: Props) {
  const { chain, network } = useApi();
  const [safetyCheck, isConfirm, setConfirm] = useSafetyCheck(call);
  const [note, setNote] = useState<string>(transaction?.note || '');
  const filterPaths = useFilterPaths(accountData, transaction);
  const [addressChain, setAddressChain] = useState<FilterPath[]>(propsFilterPaths || []);
  const [, addTx] = useBatchTxs(accountData.address);
  const navigate = useNavigate();
  const isPropose = useMemo(
    () => addressChain.length > 0 && addressChain.some((item) => item.type === 'proposer'),
    [addressChain]
  );

  const buildTx = useBuildTx(call, addressChain, transaction);

  const { isLocalAccount } = useAccount();

  const hasPermission = isLocalAccount(accountData.address);

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

  const handleAddTemplate = useCallback(() => {
    events.emit('template_add', network, call.toHex());
  }, [call, network]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  useHighlightTab();
  useCloseWhenPathChange(onClose);

  return (
    <div className='w-full p-4 sm:p-5'>
      <div className='flex items-center justify-between mb-5'>
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
      </div>

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
          <Sender address={accountData.address} />

          <AppInfo
            website={transaction?.website || website}
            iconUrl={transaction?.iconUrl || iconUrl}
            appName={transaction?.appName || appName}
          />

          <Call account={accountData.address} method={call} transaction={transaction} />

          <SafetyCheck
            isTxBundleLoading={buildTx.isLoading}
            call={call}
            account={accountData.address}
            txError={buildTx.error}
            safetyCheck={safetyCheck}
          />
        </Stack>

        <div className='sticky top-0 self-start w-full md:w-[40%] h-auto p-4 sm:p-5 shadow-medium rounded-large bg-content1 space-y-5'>
          {hasPermission && filterPaths.length > 0 && (
            <>
              <AddressChain
                deep={0}
                filterPaths={filterPaths}
                addressChain={addressChain}
                setAddressChain={setAddressChain}
              />

              <Input label='Note(Optional)' onChange={setNote} value={note} placeholder='Please note' />

              <Divider />

              {safetyCheck && safetyCheck.severity === 'warning' && (
                <Checkbox size='sm' isSelected={isConfirm} onValueChange={(state) => setConfirm(state)}>
                  I confirm recipient address exsits on the destination chain.
                </Checkbox>
              )}

              {!isPropose && (
                <SendTx
                  disabled={
                    !safetyCheck ||
                    safetyCheck.severity === 'error' ||
                    (safetyCheck.severity === 'warning' && !isConfirm)
                  }
                  buildTx={buildTx}
                  note={note}
                  onlySign={onlySign}
                  website={transaction?.website || website}
                  iconUrl={transaction?.iconUrl || iconUrl}
                  appName={transaction?.appName || appName}
                  relatedBatches={relatedBatches}
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
              {isPropose && !transaction && (
                <ProposeTx
                  call={call}
                  account={accountData.address}
                  proposer={addressChain.find((item) => item.type === 'proposer')?.address}
                  website={website}
                  iconUrl={iconUrl}
                  appName={appName}
                  note={note}
                  onProposed={() => {
                    onClose?.();

                    if (onlySign) {
                      onError?.(new Error('This transaction is proposed, please wait for it to be initialized.'));
                    } else {
                      navigate('/transactions');
                    }
                  }}
                />
              )}

              {!transaction && (
                <Button fullWidth onPress={handleAddBatch} color='primary' variant='ghost' startContent={<IconBatch />}>
                  Add To Batch
                </Button>
              )}

              {!transaction && (
                <Button
                  fullWidth
                  onPress={handleAddTemplate}
                  color='primary'
                  variant='ghost'
                  startContent={<IconTemplate />}
                >
                  Add To Template
                </Button>
              )}
            </>
          )}

          {!hasPermission ? (
            <Alert
              color='danger'
              title="You are currently not a member of this Account and won't be able to submit this transaction."
            />
          ) : filterPaths.length === 0 ? (
            <Alert color='danger' title={`This account doesn’t exist on ${chain.name}`} />
          ) : null}
        </div>
      </Paper>
    </div>
  );
}

export default TxSubmit;
