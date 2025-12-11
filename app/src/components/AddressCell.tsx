// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type {
  AccountId,
  AccountIndex,
  Address,
} from '@polkadot/types/interfaces';

import {
  addressEq,
  encodeAddress,
  useSs58Format,
  zeroAddress,
} from '@mimir-wallet/polkadot-core';
import { Badge, Button, cn } from '@mimir-wallet/ui';
import React, { useMemo } from 'react';

import AddressComp from './Address';
import AddressName from './AddressName';
import AddressNetworks from './AddressNetworks';
import CopyAddress from './CopyAddress';
import IdentityIcon from './IdentityIcon';

import { useAccount } from '@/accounts/useAccount';
import { useAddressMeta } from '@/accounts/useAddressMeta';
import IconAddressBook from '@/assets/svg/icon-address-book.svg?react';
import { useCopyAddressToClipboard } from '@/hooks/useCopyAddress';
import { useMultiChainTransactionCounts } from '@/hooks/useTransactions';

interface Props {
  defaultName?: string;
  addressCopyDisabled?: boolean;
  value?: AccountId | AccountIndex | Address | Uint8Array | string | null;
  className?: string;
  iconSize?: number;
  shorten?: boolean;
  showType?: boolean;
  withCopy?: boolean;
  withAddressBook?: boolean;
  withPendingTxCounts?: boolean;
  style?: React.CSSProperties;
  icons?: React.ReactNode;
  withIconBorder?: boolean;
  showNetworkProxied?: boolean;
}

function AddressCell({
  defaultName,
  addressCopyDisabled,
  icons,
  withPendingTxCounts,
  className,
  shorten = true,
  showType = false,
  value,
  style,
  iconSize = 30,
  withCopy = false,
  withAddressBook = false,
  withIconBorder = false,
  showNetworkProxied = false,
}: Props) {
  const { ss58: chainSS58 } = useSs58Format();
  const address = useMemo(
    () => encodeAddress(value, chainSS58),
    [value, chainSS58],
  );
  // Fetch meta once and pass to child components to avoid redundant calls
  const { meta } = useAddressMeta(address);
  const { isMultisig, isProxied, isPure } = meta || {};
  const { isLocalAccount, isLocalAddress, addAddressBook } = useAccount();
  const copyAddress = useCopyAddressToClipboard(address);

  // Only fetch transaction counts when needed to avoid unnecessary API calls
  const [transactionCounts] = useMultiChainTransactionCounts(
    withPendingTxCounts ? address : undefined,
  );
  const totalCounts = useMemo(() => {
    // Skip calculation if counts are not needed
    if (!withPendingTxCounts || !transactionCounts) return 0;

    return Object.values(transactionCounts).reduce(
      (acc, curr) => acc + curr.pending,
      0,
    );
  }, [withPendingTxCounts, transactionCounts]);

  return (
    <div
      className={`AddressCell flex min-w-0 flex-1 items-center gap-2.5 ${className}`}
      style={style}
    >
      <IdentityIcon
        className="AddressCell-Icon"
        size={iconSize}
        value={address}
        withBorder={withIconBorder}
      />
      <div className="AddressCell-Content flex min-w-0 flex-1 flex-col gap-y-0.5">
        <div className="flex min-w-0 items-center gap-1 overflow-hidden">
          <span className="AddressCell-Name min-w-0 overflow-hidden text-left font-bold text-ellipsis whitespace-nowrap">
            <AddressName defaultName={defaultName} value={value} meta={meta} />
          </span>

          {showType && isMultisig && (
            <Badge className="px-1.5" variant="secondary">
              Multisig
            </Badge>
          )}

          {showType && (isPure || isProxied) && (
            <Badge className="px-1.5" variant="purple">
              {isPure ? 'Pure' : 'Proxied'}
            </Badge>
          )}

          {withPendingTxCounts && !!totalCounts && (
            <div
              className={cn(
                'flex flex-1 min-w-3.5 max-w-4 aspect-square items-center justify-center',
                'rounded-full bg-[#FF8C00] text-[10px] leading-0 text-white',
              )}
            >
              {totalCounts}
            </div>
          )}
        </div>

        <div className="AddressCell-Address text-foreground/50 flex h-4 min-w-0 items-center text-xs">
          {showNetworkProxied && (
            <div className="mr-1 flex items-center gap-1">
              <AddressNetworks address={address} avatarSize={12} meta={meta} />
            </div>
          )}
          <span
            onClick={addressCopyDisabled ? undefined : () => copyAddress}
            className="min-w-0 truncate"
          >
            <AddressComp shorten={shorten} value={address} />
          </span>
          {withCopy && (
            <CopyAddress
              size="sm"
              address={address}
              className="shrink-0 opacity-50"
            />
          )}
          {withAddressBook &&
            address &&
            !isLocalAccount(address) &&
            !isLocalAddress(address) &&
            !addressEq(zeroAddress, address) && (
              <Button
                isIconOnly
                onClick={() => {
                  addAddressBook(address);
                }}
                variant="light"
                size="sm"
                className="text-foreground/50 h-[18px] w-[18px] shrink-0 opacity-50"
              >
                <IconAddressBook className="h-3 w-3" />
              </Button>
            )}
          {icons && <div className="shrink-0">{icons}</div>}
        </div>
      </div>
    </div>
  );
}

export default React.memo(AddressCell);
