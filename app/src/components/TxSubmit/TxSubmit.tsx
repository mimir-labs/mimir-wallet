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
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { addressEq, useApi } from '@mimir-wallet/polkadot-core';
import { Alert, Button, Checkbox, Divider } from '@mimir-wallet/ui';

import Input from '../Input';
import Chopsticks from './analytics/Chopsticks';
import DryRun from './analytics/DryRun';
import SafetyCheck from './analytics/SafetyCheck';
import { useBuildTx } from './hooks/useBuildTx';
import { useCloseWhenPathChange } from './hooks/useCloseWhenPathChange';
import { useHighlightTab } from './hooks/useHighlightTab';
import { useSafetyCheck } from './hooks/useSafetyCheck';
import AddressChain from './AddressChain';
import AppInfo from './AppInfo';
import Call from './Call';
import ProposeTx from './ProposeTx';
import Sender from './Sender';
import SendTx from './SendTx';

interface Props extends Omit<TxSubmitProps, 'accountId'> {
  accountData: AccountData;
}

function TxSubmit({
  accountData,
  call: propsCall,
  transaction,
  onlySign,
  website,
  appName,
  iconUrl,
  relatedBatches,
  alert,
  filterPaths: propsFilterPaths,
  onReject,
  onClose,
  onResults,
  onFinalized,
  onError,
  onSignature,
  beforeSend
}: Props) {
  const { current } = useAccount();
  const { chain, network, api } = useApi();
  const call = useMemo(() => {
    if (typeof propsCall === 'string') {
      return api.registry.createType('Call', propsCall);
    }

    return propsCall;
  }, [api, propsCall]);
  const [safetyCheck, isConfirm, setConfirm] = useSafetyCheck(call);
  const [note, setNote] = useState<string>(transaction?.note || '');
  const filterPaths = useFilterPaths(accountData, transaction);
  const [addressChain, setAddressChain] = useState<FilterPath[]>(propsFilterPaths || []);
  const [, addTx] = useBatchTxs(network, accountData.address);
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
    <div className='w-full p-4 sm:p-5 flex flex-col gap-5 h-[calc(100dvh-60px)]'>
      <div className='flex items-center justify-between'>
        <h4>Submit Transaction</h4>
        <Button
          isIconOnly
          variant='light'
          color='default'
          onPress={() => {
            onClose?.();
            onReject?.();
          }}
        >
          <IconClose className='w-4 h-4' />
        </Button>
      </div>

      {alert && <Alert className='flex-grow-0' color='warning' title={alert} />}

      <div className='flex-1 w-full p-0 md:p-5 flex flex-col md:flex-row gap-5 overflow-y-auto bg-transparent md:bg-content1 rounded-large shadow-none md:shadow-medium'>
        <div className='w-full md:w-[60%] p-4 md:p-0 space-y-5 shadow-medium md:shadow-none bg-content1 md:bg-transparent rounded-large'>
          <Sender address={accountData.address} />

          <AppInfo
            website={transaction?.website || website}
            iconUrl={transaction?.iconUrl || iconUrl}
            appName={transaction?.appName || appName}
          />

          <Call account={accountData.address} method={call} transaction={transaction} />

          {!api.call.dryRunApi?.dryRunCall ? (
            <Chopsticks call={call} account={accountData.address} />
          ) : (
            <DryRun call={call} account={accountData.address} />
          )}

          <SafetyCheck isTxBundleLoading={buildTx.isLoading} txError={buildTx.error} safetyCheck={safetyCheck} />
        </div>

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

              {!transaction && addressEq(current, accountData.address) && (
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
      </div>
    </div>
  );
}

export default TxSubmit;
