// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import IconWalletConnect from '@/assets/svg/icon-wallet-connect.svg?react';
import { WalletConnectContext, WalletConnectModal } from '@/features/wallet-connect';
import { useContext, useState } from 'react';
import { useToggle } from 'react-use';

import { Avatar, Badge, Button, Spinner, Tooltip } from '@mimir-wallet/ui';

function BadgeContent({ size, icon }: { size: number; icon?: string }) {
  const [showFallback, setShowFallback] = useState(false);

  if (size > 1) {
    return size;
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

  const buttonClassName = 'border-secondary w-[32px] h-[32px] sm:w-[42px] sm:h-[42px] bg-secondary sm:bg-transparent';

  if (!isReady)
    return (
      <Tooltip placement='bottom' color='default' closeDelay={0} content='Connecting to WalletConnect...'>
        <Button className={buttonClassName} color='primary' variant='ghost' radius='md'>
          <Spinner size='sm' color='current' />
        </Button>
      </Tooltip>
    );

  return (
    <>
      <Badge
        isInvisible={sessions.length === 0}
        content={<BadgeContent size={sessions.length} icon={sessions?.[0]?.peer?.metadata?.icons?.[0]} />}
        color='primary'
        placement='bottom-right'
        size='sm'
        classNames={{
          badge: (sessions.length === 1 ? ['bg-transparent p-0 border-none'] : []).concat([
            'bottom-0.5 right-1 translate-x-0 -translate-y-0 pointer-events-none'
          ])
        }}
      >
        <Tooltip placement='bottom' color='default' closeDelay={0} content='WalletConnect'>
          <Button
            isLoading={!isReady}
            isDisabled={!isReady}
            isIconOnly
            className={buttonClassName}
            color='primary'
            variant='ghost'
            radius='md'
            onPress={toggleOpen}
          >
            <IconWalletConnect />
          </Button>
        </Tooltip>
      </Badge>

      <WalletConnectModal isOpen={isOpen} onClose={toggleOpen} />
    </>
  );
}

export default WalletConnect;
