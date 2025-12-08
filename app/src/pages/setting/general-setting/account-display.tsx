// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { addressEq, addressToHex } from '@mimir-wallet/polkadot-core';
import { Button } from '@mimir-wallet/ui';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { useMemo, useRef } from 'react';

import { useAccount } from '@/accounts/useAccount';
import { AddressCell } from '@/components';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useWallet } from '@/wallet/useWallet';

const ITEM_HEIGHT = 52; // 32px height + 20px gap

function AccountDisplay() {
  const { accounts, hideAccountHex, hideAccount, showAccount } = useAccount();
  const { walletAccounts } = useWallet();
  const upSm = useMediaQuery('sm');
  const listRef = useRef<HTMLDivElement>(null);

  const list = useMemo(() => {
    // sort by hideAccountHex
    return accounts
      .sort((a) => {
        return hideAccountHex.includes(addressToHex(a.address)) ? -1 : 1;
      })
      .filter(
        (a) => !walletAccounts.some((w) => addressEq(w.address, a.address)),
      );
  }, [accounts, hideAccountHex, walletAccounts]);

  // eslint-disable-next-line react-hooks/refs
  const virtualizer = useWindowVirtualizer({
    count: list.length,
    estimateSize: () => ITEM_HEIGHT,
    overscan: 5,
    // eslint-disable-next-line react-hooks/refs
    scrollMargin: listRef.current?.offsetTop ?? 0,
  });

  return (
    <div className="card-root flex flex-col p-5">
      <div
        ref={listRef}
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const item = list[virtualItem.index];
          const isHide = hideAccountHex.includes(addressToHex(item.address));

          return (
            <div
              key={virtualItem.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start - virtualizer.options.scrollMargin}px)`,
              }}
            >
              <div className="flex h-8 items-center justify-between">
                <AddressCell
                  showNetworkProxied
                  withIconBorder
                  shorten={!upSm}
                  value={item.address}
                />
                <Button
                  variant="ghost"
                  onClick={() =>
                    isHide
                      ? showAccount(item.address)
                      : hideAccount(item.address)
                  }
                >
                  {isHide ? 'Unhide' : 'Hide'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AccountDisplay;
