// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IMethod } from '@polkadot/types/types';

import IconArrowClockWise from '@/assets/svg/icon-arrow-clock-wise.svg?react';
import IconFailed from '@/assets/svg/icon-failed-fill.svg?react';
import IconSuccess from '@/assets/svg/icon-success.svg?react';
import FormatBalance from '@/components/FormatBalance';
import { findToken } from '@/config';
import { useAssetInfo } from '@/hooks/useAssets';
import React, { useCallback, useEffect, useState } from 'react';

import { addressEq, dryRun, useApi } from '@mimir-wallet/polkadot-core';
import { Avatar, Button, Spinner } from '@mimir-wallet/ui';

import Cell from './Cell';

const EMPTY_SIMULATION = {
  isDone: false,
  success: false,
  error: null,
  isLoading: false
};

function ChangeItem({ amount, children }: { amount: bigint; children: React.ReactNode }) {
  return (
    <div className='bg-secondary rounded-medium mt-2 flex items-center justify-between gap-2.5 p-2.5'>
      <b className='text-small'>{amount > 0n ? 'Receive' : 'Send'}</b>
      {amount > 0 ? (
        <svg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 8 8' fill='none'>
          <path
            d='M8 0.981688C8 0.722177 7.89674 0.473331 7.71301 0.290062V0.283207C7.33 -0.0944014 6.71473 -0.0944014 6.33173 0.283207L1.95485 4.66691V2.13879C1.95279 1.60074 1.51603 1.16565 0.97798 1.16565C0.439927 1.16565 0.00317049 1.60074 0.00111198 2.13879V7.02313C0.00111198 7.56264 0.438474 8 0.977987 8H5.86233C6.40038 7.99794 6.83547 7.56119 6.83547 7.02313C6.83547 6.48508 6.40038 6.04833 5.86233 6.04627H3.33614L7.71301 1.67331C7.89674 1.49004 8 1.2412 8 0.981688Z'
            fill='currentColor'
            className='text-success'
          />
        </svg>
      ) : (
        <svg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 8 8' fill='none'>
          <path
            d='M0 7.01831C0 7.27782 0.103259 7.52667 0.286993 7.70994V7.71679C0.669997 8.0944 1.28527 8.0944 1.66827 7.71679L6.04515 3.33309V5.86121C6.04721 6.39926 6.48397 6.83435 7.02202 6.83435C7.56007 6.83435 7.99683 6.39926 7.99889 5.86121V0.976874C7.99889 0.437361 7.56153 0 7.02201 0H2.13767C1.59962 0.00205917 1.16453 0.438814 1.16453 0.976866C1.16453 1.51492 1.59962 1.95167 2.13767 1.95373H4.66386L0.286993 6.32669C0.103259 6.50996 0 6.7588 0 7.01831Z'
            fill='#FF5310'
            className='text-danger'
          />
        </svg>
      )}

      <div className='flex-1' />
      {children}
    </div>
  );
}

function NativeToken({ amount }: { amount: bigint }) {
  const { api, genesisHash } = useApi();
  const symbol = api.registry.chainTokens[0] || 'Native';
  const decimals = api.registry.chainDecimals[0] || 1;
  const icon = findToken(genesisHash).Icon;

  return (
    <div className='flex items-center gap-1.5'>
      <Avatar alt={symbol} style={{ width: 18, height: 18 }} src={icon} />
      <b>
        <FormatBalance withCurrency value={amount > 0n ? amount : -amount} format={[decimals, symbol]} />
      </b>
    </div>
  );
}

function AssetToken({ assetId, amount }: { assetId: string; amount: bigint }) {
  const { network } = useApi();
  const [assetInfo] = useAssetInfo(network, assetId);

  if (!assetInfo) {
    return <Spinner variant='wave' size='sm' />;
  }

  return (
    <div className='flex items-center gap-1.5'>
      <Avatar
        alt={assetInfo?.symbol}
        fallback={assetInfo?.symbol.slice(0, 1)}
        style={{ width: 18, height: 18 }}
        src={assetInfo?.icon}
      />
      <b>
        <FormatBalance
          withCurrency
          value={amount > 0n ? amount : -amount}
          format={[assetInfo.decimals, assetInfo.symbol]}
        />
      </b>
    </div>
  );
}

function SafetyCheck({ call, account }: { call: IMethod; account?: string }) {
  const [simulation, setSimulation] = useState<{
    isDone: boolean;
    success: boolean;
    error: string | null;
    isLoading: boolean;
  }>(EMPTY_SIMULATION);
  const [balancesChanges, setBalancesChanges] = useState<Record<'native' | string, bigint>>({});
  const { api } = useApi();

  const handleSimulate = useCallback(() => {
    if (account && call) {
      setSimulation({ ...EMPTY_SIMULATION, isLoading: true });
      setBalancesChanges({});

      dryRun(api, call, account)
        .then((result) => {
          if (result.success) {
            setBalancesChanges(
              result.balancesChanges.reduce(
                (acc, change) => {
                  if (addressEq(change.from, account)) {
                    acc[change.assetId] = (acc[change.assetId] || 0n) - change.amount;
                  }

                  if (addressEq(change.to, account)) {
                    acc[change.assetId] = (acc[change.assetId] || 0n) + change.amount;
                  }

                  return acc;
                },
                {} as Record<'native' | string, bigint>
              )
            );
            setSimulation({ isDone: true, success: true, error: null, isLoading: false });
          } else {
            setSimulation({ isDone: true, success: false, error: result.error.message, isLoading: false });
          }
        })
        .catch((error) => {
          setSimulation({ isDone: true, success: false, error: error.message || 'Unknown Error', isLoading: false });
        });
    }
  }, [account, api, call]);

  useEffect(() => {
    if (!simulation.isDone && !simulation.isLoading) {
      handleSimulate();
    }
  }, [handleSimulate, simulation]);

  return (
    <div>
      <div className='font-bold'>Transaction Simulation</div>
      <Cell
        title={
          <span className='inline-flex items-center gap-1'>
            Simulation
            {simulation.isDone ? (
              <Button isIconOnly variant='light' size='sm' onPress={handleSimulate}>
                <IconArrowClockWise className='h-4 w-4' />
              </Button>
            ) : null}
          </span>
        }
        img={<b>polkadot-sdk</b>}
      >
        {simulation.isDone ? (
          <div className='flex items-center gap-1'>
            {simulation.success ? (
              <IconSuccess className='text-success h-4 w-4' />
            ) : (
              <IconFailed className='text-danger h-4 w-4' />
            )}

            <p
              data-success={simulation.success}
              data-error={simulation.error}
              className='data-[success=true]:text-success data-[error]:text-danger font-bold'
            >
              {simulation.success ? 'Success' : simulation.error || 'Unknown Error'}
            </p>
          </div>
        ) : (
          <Button variant='ghost' isLoading={simulation.isLoading} onPress={handleSimulate}>
            Simulate
          </Button>
        )}
      </Cell>

      {Object.entries(balancesChanges).map(([assetId, amount]) => (
        <ChangeItem key={assetId} amount={amount}>
          {assetId === 'native' ? <NativeToken amount={amount} /> : <AssetToken assetId={assetId} amount={amount} />}
        </ChangeItem>
      ))}
    </div>
  );
}

export default React.memo(SafetyCheck);
