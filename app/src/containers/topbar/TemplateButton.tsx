// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

import IconTemplate from '@/assets/svg/icon-template.svg?react';
import { events } from '@/events';
import Template from '@/features/template';
import React, { useEffect } from 'react';

import { Button, Tooltip } from '@mimir-wallet/ui';

let index = 0;

function TemplateButton({
  isOpen,
  open,
  close
}: {
  isOpen: boolean;
  open: (element: React.ReactNode) => void;
  close: () => void;
}) {
  useEffect(() => {
    const onOpen = (network: string) => {
      open(<Template key={`open-${network}-${++index}`} defaultNetwork={network} onClose={close} />);
    };

    const onAdd = (network: string, callData: HexString) => {
      open(
        <Template
          key={`add-${network}-${++index}`}
          defaultNetwork={network}
          defaultCallData={callData}
          defaultAdded
          onClose={close}
        />
      );
    };

    events.on('template_open', onOpen);
    events.on('template_add', onAdd);

    return () => {
      events.off('template_open', onOpen);
      events.off('template_add', onAdd);
    };
  }, [open, close]);

  return (
    <Tooltip content='Template' closeDelay={0}>
      <Button
        isIconOnly
        className='border-secondary w-[32px] h-[32px] sm:w-[42px] sm:h-[42px] bg-secondary sm:bg-transparent'
        color='primary'
        variant='ghost'
        radius='md'
        onPress={() => {
          if (isOpen) {
            close();
          } else {
            open(<Template key={`default-template`} onClose={close} />);
          }
        }}
      >
        <IconTemplate className='w-[14px] h-[14px] sm:w-[19px] sm:h-[19px]' />
      </Button>
    </Tooltip>
  );
}

export default React.memo(TemplateButton);
