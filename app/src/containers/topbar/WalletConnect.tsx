// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Avatar, Badge, BadgeIndicator, Button, Spinner, Tooltip } from '@mimir-wallet/ui';
import { useContext, useEffect, useState } from 'react';
import { useToggle } from 'react-use';

import { analyticsActions } from '@/analytics';
import IconWalletConnect from '@/assets/svg/icon-wallet-connect.svg?react';
import { events } from '@/events';
import { WalletConnectContext, WalletConnectModal } from '@/features/wallet-connect';

function BadgeContent({ size, icon }: { size: number; icon?: string }) {
  const [showFallback, setShowFallback] = useState(false);

  if (size > 1) {
    return <Badge className='h-4 min-w-4 rounded-full px-1 tabular-nums'>{size}</Badge>;
  }

  return (
    <Avatar
      showFallback={showFallback}
      fallback={<Avatar src='/images/wallet-connect.webp' alt='wallet connect' style={{ width: 16, height: 16 }} />}
      src={icon}
      style={{ width: 16, height: 16 }}
      onError={() => setShowFallback(true)}
    />
  );
}

function WalletConnect() {
  const { isReady, sessions } = useContext(WalletConnectContext);
  const [isOpen, toggleOpen] = useToggle(false);

  const buttonClassName = 'border-secondary  w-[32px] h-[32px] sm:w-[42px] sm:h-[42px] bg-secondary sm:bg-transparent';

  useEffect(() => {
    const handleEvent = () => {
      toggleOpen(true);
    };

    events.on('walletconnect', handleEvent);

    return () => {
      events.off('walletconnect', handleEvent);
    };
  }, [toggleOpen]);

  if (!isReady)
    return (
      <Tooltip color='default' content='Connecting to WalletConnect...'>
        <Button className={buttonClassName} color='primary' variant='ghost' radius='md'>
          <Spinner size='sm' color='current' />
        </Button>
      </Tooltip>
    );

  return (
    <>
      <BadgeIndicator
        isInvisible={sessions.length === 0}
        content={<BadgeContent size={sessions.length} icon={sessions?.[0]?.peer?.metadata?.icons?.[0]} />}
        color='primary'
        placement='bottom-right'
        className='shrink-0'
        badgeClassName={
          sessions.length === 1
            ? 'bg-transparent p-0 border-none bottom-0.5 right-1 translate-x-0 -translate-y-0'
            : 'bottom-0.5 right-1 translate-x-0 -translate-y-0'
        }
      >
        <Tooltip color='default' content='WalletConnect'>
          <Button
            disabled={!isReady}
            isIconOnly
            className={buttonClassName}
            color='primary'
            variant='ghost'
            radius='md'
            onClick={() => {
              analyticsActions.walletConnectStart();
              toggleOpen();
            }}
          >
            <IconWalletConnect />
          </Button>
        </Tooltip>
      </BadgeIndicator>

      <WalletConnectModal isOpen={isOpen} onClose={toggleOpen} />
    </>
  );
}

export default WalletConnect;
