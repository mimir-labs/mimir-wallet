// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useLocalStore } from '@mimir-wallet/service';
import {
  Button,
  cn,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@mimir-wallet/ui';
import { Link } from '@tanstack/react-router';
import React, { useMemo, useState } from 'react';

import ArrowDown from '@/assets/svg/ArrowDown.svg?react';
import IconSend from '@/assets/svg/icon-send-fill.svg?react';
import IconSuccessFill from '@/assets/svg/icon-success-fill.svg?react';
import { HERO_TRANSFER_TYPE_KEY } from '@/constants';

// Transfer types configuration
const TRANSFER_TYPES = [
  {
    key: 'transfer',
    label: 'Transfer',
    url: 'mimir://app/transfer',
    icon: '/dapp-icons/transfer.png',
  },
  {
    key: 'multi-transfer',
    label: 'Multi-Transfer',
    url: 'mimir://app/multi-transfer',
    icon: '/dapp-icons/multi-transfer.webp',
  },
  {
    key: 'cross-chain',
    label: 'Cross-Chain Transfer',
    url: 'mimir://app/cross-chain-transfer',
    icon: '/dapp-icons/cross-chain-transfer.svg',
    gradient: true,
  },
] as const;

type TransferKey = (typeof TRANSFER_TYPES)[number]['key'];

function TransferSplitButton() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useLocalStore<TransferKey>(
    HERO_TRANSFER_TYPE_KEY,
    'transfer',
  );

  const currentTransfer = useMemo(
    () => TRANSFER_TYPES.find((t) => t.key === selectedTransfer)!,
    [selectedTransfer],
  );

  return (
    <div className="flex">
      {/* Left: main action button */}
      <Button
        asChild
        variant="solid"
        color="primary"
        size="md"
        className="h-[26px] rounded-r-none pr-[3px] pl-1 gap-[5px]"
      >
        <Link
          to="/explorer/$url"
          params={{
            url: `${currentTransfer.url}?callbackPath=${encodeURIComponent('/')}`,
          }}
        >
          <IconSend />
          {currentTransfer.label}
        </Link>
      </Button>

      {/* Right: dropdown trigger */}
      <Popover open={menuOpen} onOpenChange={setMenuOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="solid"
            color="primary"
            size="md"
            className="h-[26px] px-1 pl-[3px] rounded-l-none"
          >
            <span className="flex w-6 h-3.5 items-center justify-center rounded-full bg-background">
              <ArrowDown className="size-2.5 text-primary" />
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto min-w-[200px] p-2">
          <div className="flex flex-col gap-1">
            {TRANSFER_TYPES.map((type) => {
              const isSelected = type.key === selectedTransfer;

              return (
                <button
                  key={type.key}
                  onClick={() => {
                    setSelectedTransfer(type.key);
                    setMenuOpen(false);
                  }}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-secondary',
                    isSelected && 'bg-secondary',
                  )}
                >
                  <img
                    src={type.icon}
                    alt={type.label}
                    className="size-6 rounded-full"
                  />
                  <span
                    className={cn(
                      'flex-1 text-sm font-medium',
                      'gradient' in type &&
                        type.gradient &&
                        'bg-linear-to-r from-[#0194ff] to-[#d306ff] bg-clip-text text-transparent',
                    )}
                  >
                    {type.label}
                  </span>
                  {isSelected && (
                    <IconSuccessFill className="size-4 text-success" />
                  )}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default React.memo(TransferSplitButton);
