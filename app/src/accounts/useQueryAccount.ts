// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountData, DelegateeProp, MultisigAccountData } from '@/hooks/types';

import { addressEq, addressToHex, encodeAddress, remoteProxyRelations, useNetwork } from '@mimir-wallet/polkadot-core';
import { service, useQuery } from '@mimir-wallet/service';
import { isEqual } from 'lodash-es';
import { useEffect, useMemo } from 'react';

import { useAccount } from './useAccount';

/**
 * Transform a single proposer by encoding addresses to target chain SS58 format
 */
function transformProposer(
  proposer: NonNullable<AccountData['proposers']>[number],
  chainSS58: number
): NonNullable<AccountData['proposers']>[number] {
  return {
    proposer: encodeAddress(proposer.proposer, chainSS58),
    creator: encodeAddress(proposer.creator, chainSS58),
    createdAt: proposer.createdAt,
    network: proposer.network
  };
}

/**
 * Determine if a delegatee should be included based on genesis hash filtering
 *
 * Filtering logic:
 * 1. If not filtering by genesis hash, include all delegatees
 * 2. Include delegatees that directly match the current chain's genesis hash
 * 3. Include remote proxy relationships (e.g., Polkadot <-> AssetHub) only if:
 *    - The delegatee's proxy network has a remote relation to the current chain
 *    - AND no local proxy with the same configuration exists on the current chain
 *    This prevents duplicate display of proxies when both local and remote versions exist
 */
function shouldIncludeDelegatee(
  delegatee: AccountData['delegatees'][number],
  allDelegatees: AccountData['delegatees'],
  filterByGenesisHash: boolean,
  genesisHash?: string
): boolean {
  // Skip filtering if not enabled
  if (!filterByGenesisHash) {
    return true;
  }

  // Include proxies that directly belong to the current chain
  if (delegatee.proxyNetwork === genesisHash) {
    return true;
  }

  // Check for remote proxy relationships
  // remoteProxyRelations maps proxy networks that have cross-chain relationships
  // e.g., { 'polkadot-genesis': 'assethub-genesis', 'assethub-genesis': 'polkadot-genesis' }
  const isRemoteProxyRelation = remoteProxyRelations[delegatee.proxyNetwork] === genesisHash;

  if (!isRemoteProxyRelation) {
    return false;
  }

  // For remote proxies, check if an equivalent local proxy exists
  // If a local version exists with the same address, delay, and type, exclude the remote one
  const hasLocalEquivalent = allDelegatees.some(
    (item) =>
      item.proxyNetwork === genesisHash &&
      addressEq(item.address, delegatee.address) &&
      item.proxyDelay === delegatee.proxyDelay &&
      item.proxyType === delegatee.proxyType
  );

  return !hasLocalEquivalent;
}

/**
 * Transform a delegatee account by recursively applying transformAccount
 * and marking whether it's a remote proxy
 */
function transformDelegatee(
  delegatee: AccountData['delegatees'][number],
  chainSS58: number,
  filterByGenesisHash: boolean,
  genesisHash?: string
): AccountData & DelegateeProp {
  const transformed = transformAccount(chainSS58, delegatee, filterByGenesisHash, genesisHash);

  return {
    ...transformed,
    // Mark as remote proxy if filtering is enabled and the proxy network differs from current chain
    isRemoteProxy: filterByGenesisHash ? delegatee.proxyNetwork !== genesisHash : false
  } as AccountData & DelegateeProp;
}

/**
 * Transform multisig members by recursively applying transformAccount to each member
 * Returns an empty object if the account is not a multisig type
 */
function transformMultisigMembers(
  account: AccountData,
  chainSS58: number,
  filterByGenesisHash: boolean,
  genesisHash?: string
): Pick<MultisigAccountData, 'members'> | Record<string, never> {
  if (account.type !== 'multisig') {
    return {};
  }

  return {
    members: account.members.map((member) => transformAccount(chainSS58, member, filterByGenesisHash, genesisHash))
  };
}

/**
 * Transform account data to target chain's SS58 format
 *
 * This function recursively transforms all addresses in an account structure:
 * - Main account address
 * - Proposer addresses (for proxy accounts)
 * - Delegatee addresses (proxy relationships)
 * - Multisig member addresses (for multisig accounts)
 *
 * @param chainSS58 - Target chain's SS58 format prefix
 * @param account - Account data to transform
 * @param filterByGenesisHash - Whether to filter delegatees by genesis hash (default: false)
 * @param genesisHash - Current chain's genesis hash for filtering
 * @returns Transformed account data with addresses in target chain format
 */
export function transformAccount(
  chainSS58: number,
  account: AccountData,
  filterByGenesisHash: boolean = false,
  genesisHash?: string
): AccountData {
  // Transform proposer addresses if they exist
  const proposers = account.proposers?.map((item) => transformProposer(item, chainSS58));

  // Filter and transform delegatees based on genesis hash and remote proxy relationships
  const delegatees = account.delegatees
    .filter((delegatee, _, self) => shouldIncludeDelegatee(delegatee, self, filterByGenesisHash, genesisHash))
    .map((delegatee) => transformDelegatee(delegatee, chainSS58, filterByGenesisHash, genesisHash));

  // Transform multisig members if applicable
  const multisigMembers = transformMultisigMembers(account, chainSS58, filterByGenesisHash, genesisHash);

  return {
    ...account,
    // Hide name field for display purposes (privacy/security)
    name: undefined,
    // Encode main account address to target chain format
    address: encodeAddress(account.address, chainSS58),
    delegatees,
    ...multisigMembers,
    proposers
  };
}

/**
 * Structural sharing comparator for account data
 * Prevents unnecessary re-renders by performing deep equality checks
 * Only creates new object reference when actual data has changed
 */
const accountDataStructuralSharing = <T>(prev: T, next: T): T => {
  return isEqual(prev, next) ? prev : next;
};

/**
 * Create React Query configuration for omni-chain account fetching
 *
 * @param addressHex - Hex-encoded account address
 * @returns Query configuration object
 */
function createQueryConfig(addressHex: string) {
  return {
    queryKey: ['omni-chain-account', addressHex] as const,
    // Cache data for 6 seconds before marking as stale
    staleTime: 6_000,
    // Automatically refetch every 6 seconds to keep data fresh
    refetchInterval: 6_000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    // Only enable query when address is provided
    enabled: !!addressHex,
    // Fetch account details from service
    queryFn: ({ queryKey: [, address] }: { queryKey: readonly [string, string] }) =>
      service.account.getOmniChainDetails(address),
    structuralSharing: accountDataStructuralSharing
  };
}

/**
 * Custom hook to automatically update account metadata when account data changes
 * Syncs account information to the global account store
 */
function useAccountMetaUpdater(accountData: AccountData | null | undefined): void {
  const { updateMetas } = useAccount();

  useEffect(() => {
    if (accountData) {
      updateMetas(accountData);
    }
  }, [accountData, updateMetas]);
}

/**
 * Query account details for the current chain with genesis hash filtering
 *
 * This hook is a wrapper around useQueryAccountOmniChain that filters the results
 * to show only proxy relationships relevant to the current chain. This approach
 * reuses the omni-chain data cache, avoiding duplicate network requests.
 *
 * Use cases:
 * - Display account information on a specific chain
 * - Show proxies relevant to the current network context
 * - Filter out cross-chain proxies that have local equivalents
 *
 * @param address - Account address to query (optional)
 * @returns Tuple of [accountData, isFetched, isFetching, refetch]
 *
 * @example
 * const [account, isFetched, isFetching, refetch] = useQueryAccount('5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY');
 */
export function useQueryAccount(
  address?: string | null
): [AccountData | null | undefined, isFetched: boolean, isFetching: boolean, refetch: () => void] {
  const { chain } = useNetwork();
  const chainSS58 = chain.ss58Format;
  const genesisHash = chain.genesisHash;

  // Reuse omni-chain data to avoid duplicate requests
  const [omniChainData, isFetched, isFetching, refetch] = useQueryAccountOmniChain(address);

  // Filter account data for current chain with genesis hash filtering
  const accountData = useMemo(
    () => (omniChainData ? transformAccount(chainSS58, omniChainData, true, genesisHash) : null),
    [omniChainData, chainSS58, genesisHash]
  );

  return [accountData, isFetched, isFetching, refetch];
}

/**
 * Query account details across all chains without genesis hash filtering
 *
 * This is the base hook that fetches complete account data from the service.
 * It includes ALL proxy relationships across all chains without filtering.
 * The useQueryAccount hook wraps this to provide filtered results.
 *
 * Use cases:
 * - Display complete cross-chain account information
 * - Show all proxy relationships regardless of current network
 * - Account management interfaces that need full context
 * - Base data source for useQueryAccount
 *
 * @param address - Account address to query (optional)
 * @returns Tuple of [accountData, isFetched, isFetching, refetch, promise]
 *
 * @example
 * const [account, isFetched, isFetching, refetch, promise] = useQueryAccountOmniChain('5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY');
 */
export function useQueryAccountOmniChain(
  address?: string | null
): [
  AccountData | null | undefined,
  isFetched: boolean,
  isFetching: boolean,
  refetch: () => void,
  promise: Promise<AccountData | null>
] {
  const { chain } = useNetwork();
  const chainSS58 = chain.ss58Format;

  // Convert address to hex format for querying
  const addressHex: string = address ? addressToHex(address) : '';

  // Fetch omni-chain account data
  const { data, isFetched, isFetching, refetch, promise } = useQuery(createQueryConfig(addressHex));

  // Transform account data to current chain format WITHOUT genesis hash filtering
  const accountData = useMemo(() => (data ? transformAccount(chainSS58, data) : null), [data, chainSS58]);

  // Automatically sync account metadata to global store
  useAccountMetaUpdater(accountData);

  return [accountData, isFetched, isFetching, refetch, promise];
}
