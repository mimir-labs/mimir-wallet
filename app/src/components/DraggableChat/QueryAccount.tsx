// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountData, DelegateeProp } from '@/hooks/types';

import { useQueryAccountOmniChain } from '@/accounts/useQueryAccount';
import IconClock from '@/assets/svg/icon-clock.svg?react';
import { useMemo } from 'react';

import { allEndpoints } from '@mimir-wallet/polkadot-core';
import { Chip, Tooltip } from '@mimir-wallet/ui';

import AddressCell from '../AddressCell';

interface QueryAccountProps {
  address: string; // Single address to query
}

// Component for proxy type tags with network info tooltip
function ProxyTypeTag({ proxyType, network }: { proxyType: string; network?: string }) {
  const networkName = useMemo(() => {
    if (!network) return null;
    const endpoint = allEndpoints.find((e) => e.genesisHash === network);

    return endpoint?.name || 'Unknown Network';
  }, [network]);

  const chip = (
    <Chip size='sm' color='secondary'>
      {proxyType}
    </Chip>
  );

  if (networkName) {
    return <Tooltip content={`Network: ${networkName}`}>{chip}</Tooltip>;
  }

  return chip;
}

// Reusable AccountCard component for individual address display
function AccountCard({
  address,
  proxyType,
  delay,
  network
}: {
  address: string;
  proxyType?: string;
  delay?: number;
  network?: string;
}) {
  return (
    <div className='border-divider-300 flex w-full items-center gap-2.5 rounded-[10px] border p-[10px]'>
      <div className='flex-1'>
        <AddressCell value={address} />
      </div>
      {delay && delay > 0 ? (
        <Tooltip content={`Delay Blocks: ${delay}`}>
          <IconClock className='h-4 w-4 opacity-70' />
        </Tooltip>
      ) : null}
      {proxyType && <ProxyTypeTag proxyType={proxyType} network={network} />}
    </div>
  );
}

// Section component for grouped addresses
function AddressSection({
  title,
  addresses,
  proxyData
}: {
  title: string;
  addresses: AccountData[] | (AccountData & DelegateeProp)[];
  proxyData?: boolean;
}) {
  if (!addresses || addresses.length === 0) return null;

  return (
    <div className='flex w-full flex-col gap-[5px]'>
      <div className='text-foreground text-[14px] font-normal'>{title}</div>
      {addresses.map((account, index) => (
        <AccountCard
          key={`${account.address}-${index}`}
          address={account.address}
          proxyType={proxyData && 'proxyType' in account ? account.proxyType : undefined}
          delay={proxyData && 'proxyDelay' in account ? account.proxyDelay : undefined}
          network={proxyData && 'proxyNetwork' in account ? account.proxyNetwork : undefined}
        />
      ))}
    </div>
  );
}

// Empty state component
function EmptyState() {
  return (
    <div className='border-divider-300 flex w-full items-center justify-center rounded-[10px] border p-[10px]'>
      <div className='text-foreground/50 text-[14px]'>No account data found</div>
    </div>
  );
}

// Main QueryAccount component
function QueryAccount({ address }: QueryAccountProps) {
  const [accountData, isFetched, isFetching] = useQueryAccountOmniChain(address);

  // Show loading state
  if (isFetching && !accountData) {
    return (
      <div className='flex w-full flex-col items-start gap-[5px]'>
        <div className='text-foreground text-[14px]'>Loading account data...</div>
        <div className='border-divider-300 flex w-full items-center justify-center rounded-[10px] border p-[10px]'>
          <div className='text-foreground/50 text-[14px]'>Fetching account information...</div>
        </div>
      </div>
    );
  }

  // Show empty state if no data
  if (isFetched && !accountData) {
    return (
      <div className='flex w-full flex-col items-start gap-[5px]'>
        <div className='text-foreground text-[14px]'>Account Information</div>
        <EmptyState />
      </div>
    );
  }

  if (!accountData) return null;

  // Extract data for different sections
  const members = accountData.type === 'multisig' ? accountData.members : [];
  const proxies = accountData.delegatees || [];
  const proposers =
    accountData.proposers?.map((p) => ({
      address: p.proposer,
      name: undefined,
      type: 'account' as const,
      createdAt: Date.now(),
      delegatees: [],
      isMimir: false
    })) || [];

  // Calculate section titles with counts
  const multisigTitle =
    accountData.type === 'multisig' ? `Multisig Members (${accountData.threshold}/${members.length})` : null;
  const proxyTitle = proxies.length > 0 ? `Proxy Accounts (${proxies.length})` : null;
  const proposerTitle = proposers.length > 0 ? `Proposers (${proposers.length})` : null;

  const hasAnyData = members.length > 0 || proxies.length > 0 || proposers.length > 0;

  return (
    <div className='flex w-full flex-col items-start gap-[10px]'>
      <div className='text-foreground text-[14px] font-normal'>Account Information</div>

      {hasAnyData ? (
        <div className='flex w-full flex-col gap-[10px]'>
          {multisigTitle && <AddressSection title={multisigTitle} addresses={members} />}

          {proxyTitle && <AddressSection title={proxyTitle} addresses={proxies} proxyData />}

          {proposerTitle && <AddressSection title={proposerTitle} addresses={proposers} />}
        </div>
      ) : (
        // Show the queried address itself when no other data is available
        <div className='flex w-full flex-col gap-[5px]'>
          <div className='text-foreground text-[14px] font-normal'>Queried Address</div>
          <AccountCard address={address} />
        </div>
      )}
    </div>
  );
}

export default QueryAccount;
