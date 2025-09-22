// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IMethod } from '@polkadot/types/types';
import type { HexString } from '@mimir-wallet/service';

import { FormatBalance } from '@/components';
import CopyButton from '@/components/CopyButton';
import { findToken } from '@/config';
import { useXcmAsset } from '@/hooks/useXcmAssets';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import {
  addressEq,
  type BalanceChange,
  dryRun,
  dryRunWithXcm,
  getChainIcon,
  SubApiRoot,
  useApi,
  useNetworks
} from '@mimir-wallet/polkadot-core';
import { Avatar, Button, Spinner } from '@mimir-wallet/ui';

const EMPTY_SIMULATION = {
  isDone: false,
  success: false,
  error: null,
  isLoading: false
};

// Operation Item Component matching Figma design
function OperationItem({
  type,
  genesisHash,
  amount,
  assetId
}: {
  type: 'Receive' | 'Send' | 'Lock' | 'Unlock';
  genesisHash: HexString;
  amount: bigint;
  assetId: string;
}) {
  const { enableNetwork } = useNetworks();

  const getActionEmoji = () => {
    switch (type) {
      case 'Receive':
        return <span className='text-success'> ↙</span>;
      case 'Send':
        return <span className='text-danger'> ↗</span>;
      case 'Lock':
        return ' 🔒';
      case 'Unlock':
        return ' 🔓';
      default:
        return '';
    }
  };

  useEffect(() => {
    enableNetwork(genesisHash);
  }, [enableNetwork, genesisHash]);

  return (
    <SubApiRoot network={genesisHash} Fallback={() => <Spinner variant='wave' size='sm' />}>
      <div className='bg-secondary flex items-center justify-between rounded-[5px] p-[5px] text-xs'>
        <div className='text-foreground'>
          {type}
          {getActionEmoji()}
        </div>
        {assetId === 'native' ? (
          <NativeToken genesisHash={genesisHash} amount={amount} />
        ) : (
          <AssetToken genesisHash={genesisHash} assetId={assetId} amount={amount} />
        )}
      </div>
    </SubApiRoot>
  );
}

function NativeToken({ genesisHash, amount }: { genesisHash: HexString; amount: bigint }) {
  const { api } = useApi();
  const symbol = api.registry.chainTokens[0] || 'Native';
  const decimals = api.registry.chainDecimals[0] || 1;
  const icon = findToken(genesisHash).Icon;
  const chainIcon = useMemo(() => getChainIcon(genesisHash)?.icon, [genesisHash]);

  return (
    <span>
      <FormatBalance
        className='gap-[5px]'
        icon={
          <div className='relative'>
            <Avatar alt={symbol} style={{ width: 16, height: 16 }} src={icon} />
            <Avatar
              className='absolute right-0 bottom-0 border-1 border-black'
              style={{ width: 8, height: 8 }}
              src={chainIcon}
            />
          </div>
        }
        withCurrency
        value={amount > 0n ? amount : -amount}
        format={[decimals, symbol]}
      />
    </span>
  );
}

function AssetToken({ genesisHash, assetId, amount }: { genesisHash: HexString; assetId: string; amount: bigint }) {
  const { network } = useApi();
  const chainIcon = useMemo(() => getChainIcon(genesisHash)?.icon, [genesisHash]);
  const [assetInfo] = useXcmAsset(network, assetId);

  if (!assetInfo) {
    return <Spinner variant='wave' size='sm' />;
  }

  return (
    <span>
      <FormatBalance
        icon={
          <div className='relative'>
            <Avatar
              alt={assetInfo?.symbol}
              fallback={assetInfo?.symbol.slice(0, 1)}
              style={{ width: 16, height: 16 }}
              src={assetInfo?.logoUri}
            />
            <Avatar
              className='absolute right-0 bottom-0 border-1 border-black'
              style={{ width: 8, height: 8 }}
              src={chainIcon}
            />
          </div>
        }
        withCurrency
        value={amount > 0n ? amount : -amount}
        format={[assetInfo.decimals, assetInfo.symbol || 'UNKNOWN']}
      />
    </span>
  );
}

function DryRunPending({ title }: { title: string }) {
  return (
    <div className='bg-secondary flex items-center justify-between rounded-[10px] p-2.5'>
      <div className='flex items-center gap-2'>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='24'
          height='25'
          viewBox='0 0 24 25'
          fill='none'
          className='animate-hourglass-flip text-warning'
        >
          <path
            d='M18.75 7.59125V4.25C18.75 3.85218 18.592 3.47064 18.3107 3.18934C18.0294 2.90804 17.6478 2.75 17.25 2.75H6.75C6.35218 2.75 5.97064 2.90804 5.68934 3.18934C5.40804 3.47064 5.25 3.85218 5.25 4.25V7.625C5.25051 7.85778 5.30495 8.08727 5.40905 8.29548C5.51315 8.50368 5.66408 8.68493 5.85 8.825L10.7503 12.5L5.85 16.175C5.66408 16.3151 5.51315 16.4963 5.40905 16.7045C5.30495 16.9127 5.25051 17.1422 5.25 17.375V20.75C5.25 21.1478 5.40804 21.5294 5.68934 21.8107C5.97064 22.092 6.35218 22.25 6.75 22.25H17.25C17.6478 22.25 18.0294 22.092 18.3107 21.8107C18.592 21.5294 18.75 21.1478 18.75 20.75V17.4088C18.7495 17.1769 18.6955 16.9482 18.5922 16.7406C18.489 16.533 18.3393 16.3519 18.1547 16.2116L13.2441 12.5L18.1547 8.78844C18.3393 8.64807 18.489 8.46703 18.5922 8.2594C18.6955 8.05177 18.7495 7.82313 18.75 7.59125ZM17.25 4.25V6.5H6.75V4.25H17.25ZM17.25 20.75H6.75V17.375L12 13.4375L17.25 17.4078V20.75Z'
            fill='currentColor'
          />
        </svg>
        <b className='animate-dots'>{title}</b>
      </div>
    </div>
  );
}

function DryRunSuccess({
  title,
  rawEvents,
  balancesChanges
}: {
  title: string;
  rawEvents?: any;
  balancesChanges: SelfBalanceChange[];
}) {
  return (
    <div className='border-divider-300 flex items-start justify-between gap-2.5 rounded-[10px] border p-2.5'>
      {/* Header with left-right layout */}
      <div className='flex flex-1 items-center gap-2.5'>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='24'
          height='24'
          viewBox='0 0 24 24'
          fill='none'
          className='text-success'
        >
          <path
            d='M12 2.25C10.0716 2.25 8.18657 2.82183 6.58319 3.89317C4.97982 4.96451 3.73013 6.48726 2.99218 8.26884C2.25422 10.0504 2.06114 12.0108 2.43735 13.9021C2.81355 15.7934 3.74215 17.5307 5.10571 18.8943C6.46928 20.2579 8.20656 21.1865 10.0979 21.5627C11.9892 21.9389 13.9496 21.7458 15.7312 21.0078C17.5127 20.2699 19.0355 19.0202 20.1068 17.4168C21.1782 15.8134 21.75 13.9284 21.75 12C21.7473 9.41498 20.7192 6.93661 18.8913 5.10872C17.0634 3.28084 14.585 2.25273 12 2.25ZM16.2806 10.2806L11.0306 15.5306C10.961 15.6004 10.8783 15.6557 10.7872 15.6934C10.6962 15.7312 10.5986 15.7506 10.5 15.7506C10.4014 15.7506 10.3038 15.7312 10.2128 15.6934C10.1218 15.6557 10.039 15.6004 9.96938 15.5306L7.71938 13.2806C7.57865 13.1399 7.49959 12.949 7.49959 12.75C7.49959 12.551 7.57865 12.3601 7.71938 12.2194C7.86011 12.0786 8.05098 11.9996 8.25 11.9996C8.44903 11.9996 8.6399 12.0786 8.78063 12.2194L10.5 13.9397L15.2194 9.21937C15.2891 9.14969 15.3718 9.09442 15.4628 9.0567C15.5539 9.01899 15.6515 8.99958 15.75 8.99958C15.8486 8.99958 15.9461 9.01899 16.0372 9.0567C16.1282 9.09442 16.2109 9.14969 16.2806 9.21937C16.3503 9.28906 16.4056 9.37178 16.4433 9.46283C16.481 9.55387 16.5004 9.65145 16.5004 9.75C16.5004 9.84855 16.481 9.94613 16.4433 10.0372C16.4056 10.1282 16.3503 10.2109 16.2806 10.2806Z'
            fill='currentColor'
          />
        </svg>
        <b>{title}</b>
      </div>

      {/* Operations List */}
      <div className='flex flex-1 flex-col gap-2.5'>
        {balancesChanges.map(({ genesisHash, assetId, amount }) => (
          <OperationItem
            key={`${genesisHash}-${assetId}`}
            genesisHash={genesisHash}
            type={amount > 0n ? 'Receive' : 'Send'}
            amount={amount}
            assetId={assetId}
          />
        ))}

        {rawEvents && (
          <CopyButton
            mode='text'
            value={JSON.stringify(rawEvents, null, 2)}
            size='sm'
            variant='light'
            color='primary'
            className='self-end text-xs'
          >
            Copy All Event
          </CopyButton>
        )}
      </div>
    </div>
  );
}

function DryRunFailed({ title, error }: { title: string; error?: string | null }) {
  return (
    <div className='border-divider-300 flex items-center justify-between gap-2.5 rounded-[10px] border p-2.5'>
      <div className='flex items-center gap-2.5'>
        <div className='flex h-6 w-6 items-center justify-center'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='18'
            height='18'
            viewBox='0 0 18 18'
            fill='none'
            className='text-danger'
          >
            <path
              d='M16.5 0H1.5C1.10218 0 0.720644 0.158035 0.43934 0.43934C0.158035 0.720644 0 1.10218 0 1.5V16.5C0 16.8978 0.158035 17.2794 0.43934 17.5607C0.720644 17.842 1.10218 18 1.5 18H16.5C16.8978 18 17.2794 17.842 17.5607 17.5607C17.842 17.2794 18 16.8978 18 16.5V1.5C18 1.10218 17.842 0.720644 17.5607 0.43934C17.2794 0.158035 16.8978 0 16.5 0ZM12.5306 11.4694C12.6003 11.5391 12.6556 11.6218 12.6933 11.7128C12.731 11.8039 12.7504 11.9015 12.7504 12C12.7504 12.0985 12.731 12.1961 12.6933 12.2872C12.6556 12.3782 12.6003 12.4609 12.5306 12.5306C12.4609 12.6003 12.3782 12.6556 12.2872 12.6933C12.1961 12.731 12.0985 12.7504 12 12.7504C11.9015 12.7504 11.8039 12.731 11.7128 12.6933C11.6218 12.6556 11.5391 12.6003 11.4694 12.5306L9 10.0603L6.53063 12.5306C6.46094 12.6003 6.37822 12.6556 6.28717 12.6933C6.19613 12.731 6.09855 12.7504 6 12.7504C5.90145 12.7504 5.80387 12.731 5.71283 12.6933C5.62178 12.6556 5.53906 12.6003 5.46937 12.5306C5.39969 12.4609 5.34442 12.3782 5.3067 12.2872C5.26899 12.1961 5.24958 12.0985 5.24958 12C5.24958 11.9015 5.26899 11.8039 5.3067 11.7128C5.34442 11.6218 5.39969 11.5391 5.46937 11.4694L7.93969 9L5.46937 6.53063C5.32864 6.38989 5.24958 6.19902 5.24958 6C5.24958 5.80098 5.32864 5.61011 5.46937 5.46937C5.61011 5.32864 5.80098 5.24958 6 5.24958C6.19902 5.24958 6.38989 5.32864 6.53063 5.46937L9 7.93969L11.4694 5.46937C11.5391 5.39969 11.6218 5.34442 11.7128 5.3067C11.8039 5.26899 11.9015 5.24958 12 5.24958C12.0985 5.24958 12.1961 5.26899 12.2872 5.3067C12.3782 5.34442 12.4609 5.39969 12.5306 5.46937C12.6003 5.53906 12.6556 5.62178 12.6933 5.71283C12.731 5.80387 12.7504 5.90145 12.7504 6C12.7504 6.09855 12.731 6.19613 12.6933 6.28717C12.6556 6.37822 12.6003 6.46094 12.5306 6.53063L10.0603 9L12.5306 11.4694Z'
              fill='currentColor'
            />
          </svg>
        </div>
        <b>{title}</b>
      </div>
      <span className='text-danger'>Error: {error || 'Unknown Error'}</span>
    </div>
  );
}

type SelfBalanceChange = { genesisHash: HexString; assetId: string | 'native'; amount: bigint };

function extraBalancesChange(address: string, balancesChanges: BalanceChange[]) {
  const results: { genesisHash: HexString; assetId: string | 'native'; amount: bigint }[] = [];

  for (const change of balancesChanges) {
    if (addressEq(change.from, address)) {
      const exists = results.find((item) => item.genesisHash === change.genesisHash && item.assetId === change.assetId);

      if (exists) {
        exists.amount -= change.amount;
      } else {
        results.push({
          genesisHash: change.genesisHash,
          assetId: change.assetId,
          amount: -change.amount
        });
      }
    }

    if (addressEq(change.to, address)) {
      const exists = results.find((item) => item.genesisHash === change.genesisHash && item.assetId === change.assetId);

      if (exists) {
        exists.amount += change.amount;
      } else {
        results.push({
          genesisHash: change.genesisHash,
          assetId: change.assetId,
          amount: change.amount
        });
      }
    }
  }

  return results.filter((item) => item.amount !== 0n);
}

function DryRun({ call, account }: { call: IMethod; account?: string }) {
  const [simulation, setSimulation] = useState<{
    isDone: boolean;
    success: boolean;
    error: string | null;
    isLoading: boolean;
  }>(EMPTY_SIMULATION);
  const [crossChainSimulation, setCrossChainSimulation] = useState<{
    isDone: boolean;
    success: boolean;
    error: string | null;
    isLoading: boolean;
  }>(EMPTY_SIMULATION);
  const [balancesChanges, setBalancesChanges] = useState<SelfBalanceChange[]>([]);
  const { api } = useApi();
  const [rawEvents, setRawEvents] = useState<any>();

  const handleSimulate = useCallback(() => {
    if (account && call) {
      setSimulation({ ...EMPTY_SIMULATION, isLoading: true });
      setCrossChainSimulation({ ...EMPTY_SIMULATION, isLoading: true });
      setBalancesChanges([]);

      dryRun(api, call, account)
        .then((result) => {
          setRawEvents(result.rawEvents);

          if (result.success) {
            const balancesChanges = result.balancesChanges;

            setBalancesChanges(extraBalancesChange(account, balancesChanges));
            setSimulation({ isDone: true, success: true, error: null, isLoading: false });

            if (result.forwardedXcms.length > 0) {
              dryRunWithXcm(api, result.forwardedXcms)
                .then((result) => {
                  const errorResult = result.find((item) => !item.success);

                  if (errorResult) {
                    setCrossChainSimulation({
                      isDone: true,
                      success: false,
                      error: errorResult.error.message,
                      isLoading: false
                    });
                  } else {
                    setBalancesChanges(
                      extraBalancesChange(
                        account,
                        balancesChanges.concat(result.map((item) => (item.success ? item.balancesChanges : [])).flat())
                      )
                    );

                    setCrossChainSimulation({ isDone: true, success: true, error: null, isLoading: false });
                  }
                })
                .catch((error) => {
                  console.error(error);
                  setCrossChainSimulation({
                    isDone: true,
                    success: false,
                    error: error.message || 'Unknown Error',
                    isLoading: false
                  });
                });
            } else {
              setCrossChainSimulation({ isDone: true, success: true, error: null, isLoading: false });
            }
          } else {
            setSimulation({ isDone: true, success: false, error: result.error.message, isLoading: false });
            setCrossChainSimulation({ ...EMPTY_SIMULATION, isLoading: true });
          }
        })
        .catch((error) => {
          console.error(error);
          setSimulation({ isDone: true, success: false, error: error.message || 'Unknown Error', isLoading: false });
          setCrossChainSimulation({ ...EMPTY_SIMULATION, isLoading: true });
        });
    }
  }, [account, api, call]);

  useEffect(() => {
    if (!simulation.isDone && !simulation.isLoading) {
      handleSimulate();
    }
  }, [handleSimulate, simulation]);

  // Error State
  if (simulation.isDone && !simulation.success) {
    return <DryRunFailed title='Simulation Result: Failed!' error={simulation.error} />;
  }

  // Loading State
  if (simulation.isLoading || crossChainSimulation.isLoading) {
    return <DryRunPending title={simulation.isLoading ? 'Simulating...' : 'Cross-Chain Simulating...'} />;
  }

  // Success State
  if (simulation.isDone && simulation.success) {
    if (crossChainSimulation.isDone && !crossChainSimulation.success) {
      return <DryRunFailed title='Cross-Chain Simulation Result: Failed!' error={crossChainSimulation.error} />;
    }

    return (
      <DryRunSuccess
        title={crossChainSimulation.success ? 'Cross-Chain Simulation Result' : 'Simulation Result Success!'}
        balancesChanges={balancesChanges}
        rawEvents={rawEvents}
      />
    );
  }

  // Initial State
  return (
    <div className='bg-secondary flex items-center justify-between rounded-[10px] p-2.5'>
      <b>Ready to simulate</b>
      <Button size='sm' variant='ghost' onClick={handleSimulate}>
        Simulate
      </Button>
    </div>
  );
}

export default React.memo(DryRun);
