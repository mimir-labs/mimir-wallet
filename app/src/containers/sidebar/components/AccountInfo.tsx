// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import ArrowRight from '@/assets/svg/ArrowRight.svg?react';
import IconLink from '@/assets/svg/icon-link.svg?react';
import IconQr from '@/assets/svg/icon-qr.svg?react';
import IconTransfer from '@/assets/svg/icon-transfer.svg?react';
import { AddressCell, CopyAddress } from '@/components';
import { useAddressExplorer } from '@/hooks/useAddressExplorer';
import { useBalanceTotalUsd } from '@/hooks/useChainBalances';
import { useQrAddress } from '@/hooks/useQrAddress';
import { formatDisplay } from '@/utils';
import { memo, useCallback } from 'react';
import { Link } from 'react-router-dom';

import { Button, Divider, Tooltip } from '@mimir-wallet/ui';

interface AccountInfoProps {
  /** Selected account address */
  address: string;
  /** Handler for account menu open */
  onAccountOpen: () => void;
}

/**
 * Account information display component
 * Shows account details, balance, and action buttons
 */
function AccountInfoComponent({ address, onAccountOpen }: AccountInfoProps) {
  const [totalUsd] = useBalanceTotalUsd(address);
  const { open: openQr } = useQrAddress();
  const { open: openExplorer } = useAddressExplorer();

  const handleAccountOpen = useCallback(() => {
    onAccountOpen();
  }, [onAccountOpen]);

  const handleQrOpen = useCallback(() => {
    openQr(address);
  }, [openQr, address]);

  const handleExplorerOpen = useCallback(() => {
    openExplorer(address);
  }, [openExplorer, address]);

  // Format USD balance display
  const formatUsd = formatDisplay(totalUsd.toString());

  return (
    <div className='border-secondary rounded-[10px] border-1'>
      {/* Account header with address */}
      <div
        className='hover:bg-secondary transition-background flex w-full cursor-pointer items-center gap-2.5 rounded-t-[10px] bg-transparent p-2.5'
        onClick={handleAccountOpen}
      >
        <AddressCell value={address} addressCopyDisabled />
        <ArrowRight className='text-primary' />
      </div>

      <Divider className='mx-2.5 w-auto' />

      {/* Balance display */}
      <p className='text-foreground/65 p-2.5 text-xs'>
        $ {formatUsd[0]}
        {formatUsd[1] ? `.${formatUsd[1]}` : ''}
        {formatUsd[2] || ''}
      </p>

      <Divider className='mx-2.5 w-auto' />

      {/* Action buttons */}
      <div className='flex items-center p-2.5'>
        <Tooltip content='QR Code'>
          <Button
            isIconOnly
            className='h-[26px] min-h-[0px] w-[26px] min-w-[0px]'
            color='primary'
            variant='light'
            onClick={handleQrOpen}
            size='sm'
          >
            <IconQr className='h-4 w-4' />
          </Button>
        </Tooltip>
        <Tooltip content='Copy'>
          <CopyAddress address={address} color='primary' className='text-primary opacity-100' />
        </Tooltip>
        <Tooltip content='Explorer'>
          <Button
            isIconOnly
            className='h-[26px] min-h-[0px] w-[26px] min-w-[0px]'
            color='primary'
            variant='light'
            size='sm'
            onClick={handleExplorerOpen}
          >
            <IconLink className='h-4 w-4' />
          </Button>
        </Tooltip>
        <Tooltip content='Transfer'>
          <Button
            asChild
            isIconOnly
            className='h-[26px] min-h-[0px] w-[26px] min-w-[0px]'
            color='primary'
            variant='light'
            size='sm'
          >
            <Link to={`/explorer/${encodeURI('mimir://app/transfer')}`}>
              <IconTransfer className='h-4 w-4' />
            </Link>
          </Button>
        </Tooltip>
      </div>
    </div>
  );
}

/**
 * Memoized AccountInfo component to prevent unnecessary re-renders
 * Only re-renders when address or onAccountOpen changes
 */
export const AccountInfo = memo(AccountInfoComponent);
