// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TxSubmitProps } from './types';
import type { AccountData, FilterPath } from '@/hooks/types';
import type { CompleteEnhancedAssetInfo } from '@mimir-wallet/service';

import { addressEq, useNetwork } from '@mimir-wallet/polkadot-core';
import { Alert, AlertTitle, Button, Divider, Skeleton } from '@mimir-wallet/ui';
import { useNavigate } from '@tanstack/react-router';
import { useCallback, useEffect, useMemo, useState } from 'react';

import CustomGasFeeSelect from '../CustomGasFeeSelect';
import Input from '../Input';

import AddressChain from './AddressChain';
import Chopsticks from './analytics/Chopsticks';
import DryRun from './analytics/DryRun';
import Call from './Call';
import Confirmations from './Confirmations';
import { useBuildTx } from './hooks/useBuildTx';
import { useCloseWhenPathChange } from './hooks/useCloseWhenPathChange';
import { useHighlightTab } from './hooks/useHighlightTab';
import LockInfo from './LockInfo';
import ProposeTx from './ProposeTx';
import SendTx from './SendTx';
import TxInfo from './TxInfo';

import { useAccount } from '@/accounts/useAccount';
import IconBatch from '@/assets/svg/icon-batch.svg?react';
import IconClose from '@/assets/svg/icon-close.svg?react';
import IconTemplate from '@/assets/svg/icon-template.svg?react';
import { events } from '@/events';
import { useAssetConversion } from '@/hooks/useAssetConversion';
import { useBatchTxs } from '@/hooks/useBatchTxs';
import { useBalanceByIdentifier } from '@/hooks/useChainBalances';
import { useSupportsDryRun } from '@/hooks/useChainCapabilities';
import { useFilterPaths } from '@/hooks/useFilterPaths';
import { useGasFeeEstimate } from '@/hooks/useGasFeeEstimate';
import { useRegistry } from '@/hooks/useRegistry';

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
  const { chain, network } = useNetwork();
  const { supportsDryRun } = useSupportsDryRun(network);
  const { registry } = useRegistry(network);

  const call = useMemo(() => {
    if (typeof propsCall === 'string') {
      if (!registry) return null;

      return registry.createType('Call', propsCall);
    }

    return propsCall;
  }, [registry, propsCall]);
  // const [safetyCheck, isConfirm, setConfirm] = useSafetyCheck(call);
  const [note, setNote] = useState<string>(transaction?.note || '');
  const filterPaths = useFilterPaths(accountData, transaction);
  const [addressChain, setAddressChain] = useState<FilterPath[]>(propsFilterPaths || []);
  const [, addTx] = useBatchTxs(network, accountData.address);
  const navigate = useNavigate();
  const isPropose = useMemo(
    () => addressChain.length > 0 && addressChain.some((item) => item.type === 'proposer'),
    [addressChain]
  );
  const buildTx = useBuildTx(network, call ?? undefined, addressChain, transaction);

  // Gas fee calculation state
  const nativeGasFee = useGasFeeEstimate(buildTx.txBundle?.tx || null, buildTx.txBundle?.signer);
  const [selectedFeeAsset, setSelectedFeeAsset] = useState<CompleteEnhancedAssetInfo | null>(null);
  const convertedFee = useAssetConversion(network, nativeGasFee, selectedFeeAsset);

  const gasFeeInfo = useMemo(() => {
    if (convertedFee === undefined || convertedFee === null || !selectedFeeAsset) {
      return null;
    }

    return {
      amount: convertedFee,
      symbol: selectedFeeAsset.symbol,
      decimals: selectedFeeAsset.decimals
    };
  }, [convertedFee, selectedFeeAsset]);

  const [assetBalance] = useBalanceByIdentifier(
    network,
    buildTx.txBundle?.signer,
    selectedFeeAsset?.isNative ? 'native' : selectedFeeAsset?.assetId
  );
  const [nativeBalance] = useBalanceByIdentifier(network, buildTx.txBundle?.signer, 'native');

  const gasFeeWarning = useMemo(() => {
    if (!selectedFeeAsset) {
      return false;
    }

    if (selectedFeeAsset.isNative) {
      if (!nativeGasFee) {
        return false;
      }

      return nativeBalance ? nativeBalance.transferrable <= nativeGasFee : false;
    } else {
      if (!convertedFee) {
        return false;
      }

      return assetBalance ? assetBalance.transferrable <= convertedFee : false;
    }
  }, [assetBalance, convertedFee, nativeBalance, nativeGasFee, selectedFeeAsset]);

  const { isLocalAccount } = useAccount();

  const hasPermission = isLocalAccount(accountData.address);

  const handleAddBatch = useCallback(() => {
    if (!call) return;

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
    if (!call) return;

    events.emit('template_add', network, call.toHex());
  }, [call, network]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  useHighlightTab();
  useCloseWhenPathChange(onClose);

  return (
    <div className='flex h-[calc(100dvh-60px)] w-full flex-col gap-5 p-4 sm:p-5'>
      <div className='flex items-center justify-between'>
        <h4>Submit Transaction</h4>
        <Button
          isIconOnly
          variant='light'
          className='text-inherit'
          onClick={() => {
            onClose?.();
            onReject?.();
          }}
        >
          <IconClose className='h-4 w-4' />
        </Button>
      </div>

      {alert && (
        <Alert className='grow-0'>
          <AlertTitle>{alert}</AlertTitle>
        </Alert>
      )}

      <div className='md:bg-background flex w-full flex-1 flex-col gap-5 overflow-y-auto rounded-[20px] bg-transparent p-0 shadow-none md:flex-row md:p-5 md:shadow-md'>
        <div className='bg-background @container flex w-full flex-col gap-5 rounded-[20px] p-4 shadow-md md:w-[60%] md:bg-transparent md:p-0 md:shadow-none'>
          <TxInfo
            address={accountData.address}
            website={transaction?.website || website}
            iconUrl={transaction?.iconUrl || iconUrl}
            appName={transaction?.appName || appName}
          />

          <Divider />

          {call ? (
            <>
              <Call account={accountData.address} method={call} transaction={transaction} />
              {supportsDryRun ? (
                <DryRun call={call} account={accountData.address} />
              ) : (
                <Chopsticks call={call} account={accountData.address} />
              )}
            </>
          ) : (
            <div className='flex flex-col gap-5'>
              {/* Call element skeleton */}
              <div className='flex flex-col gap-2'>
                <Skeleton className='h-5 w-24 rounded-lg' />
                <Skeleton className='h-12 w-full rounded-lg' />
              </div>

              <Divider />

              {/* CallInfo skeleton */}
              <div className='flex flex-col gap-2'>
                <Skeleton className='h-5 w-32 rounded-lg' />
                <Skeleton className='bg-secondary h-16 w-full rounded-[10px]' />
              </div>

              {/* TransactionInfo skeleton */}
              <div className='flex flex-col gap-2'>
                <Skeleton className='h-5 w-24 rounded-lg' />
              </div>

              {/* DryRun skeleton */}
              <Skeleton className='bg-secondary h-12 w-full rounded-[10px]' />
            </div>
          )}

          {/* <SafetyCheck safetyCheck={safetyCheck} /> */}
        </div>

        <div className='bg-background sticky top-0 flex h-auto w-full flex-col gap-y-5 self-start rounded-[20px] p-4 shadow-md sm:p-5 md:w-[40%]'>
          {!hasPermission ? (
            <Alert variant='destructive'>
              <AlertTitle>
                {`You are currently not a member of this Account and won't be able to submit this transaction.`}
              </AlertTitle>
            </Alert>
          ) : filterPaths.length === 0 ? (
            <Alert variant='destructive'>
              <AlertTitle>
                {`This account doesn't exist on`} {chain.name}
              </AlertTitle>
            </Alert>
          ) : null}

          {hasPermission && filterPaths.length > 0 && (
            <>
              {transaction && <Confirmations account={accountData} transaction={transaction} />}

              <AddressChain
                deep={0}
                filterPaths={filterPaths}
                addressChain={addressChain}
                setAddressChain={setAddressChain}
              />

              <Input label='Note(Optional)' onChange={setNote} value={note} placeholder='Please note' />

              {/* {safetyCheck && safetyCheck.severity === 'warning' && (
                <Checkbox size='sm' isSelected={isConfirm} onValueChange={(state) => setConfirm(state)}>
                  I confirm recipient address exsits on the destination chain.
                </Checkbox>
              )} */}

              {buildTx.txBundle?.signer ? (
                <CustomGasFeeSelect
                  network={network}
                  gasFeeInfo={gasFeeInfo}
                  address={buildTx.txBundle.signer}
                  onChange={(asset) => {
                    setSelectedFeeAsset(asset);
                  }}
                />
              ) : null}

              {gasFeeWarning && (
                <Alert variant='warning'>
                  <AlertTitle>The selected asset is not enough to pay the gas fee.</AlertTitle>
                </Alert>
              )}

              {!isPropose && (
                <SendTx
                  disabled={
                    // !safetyCheck ||
                    // safetyCheck.severity === 'error' ||
                    // (safetyCheck.severity === 'warning' && !isConfirm) ||
                    !!buildTx.error
                  }
                  assetId={selectedFeeAsset?.assetId}
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
                      navigate({ to: '/transactions' });
                    }
                  }}
                />
              )}

              {!transaction && addressEq(current, accountData.address) && (
                <Button fullWidth onClick={handleAddBatch} color='primary' variant='ghost'>
                  <IconBatch />
                  Add To Batch
                </Button>
              )}

              {!transaction && (
                <Button fullWidth onClick={handleAddTemplate} color='primary' variant='ghost'>
                  <IconTemplate />
                  Add To Template
                </Button>
              )}

              <LockInfo buildTx={buildTx} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default TxSubmit;
