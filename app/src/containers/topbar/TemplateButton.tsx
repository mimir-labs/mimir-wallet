// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

import IconTemplate from '@/assets/svg/icon-template.svg?react';
import { events } from '@/events';
import Template from '@/features/template';
import React, { useEffect } from 'react';

import { SubApiRoot } from '@mimir-wallet/polkadot-core';
import { Button, Tooltip } from '@mimir-wallet/ui';

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
    const onOpen = () => {
      open(
        <SubApiRoot>
          <Template onClose={close} />
        </SubApiRoot>
      );
    };

    const onAdd = (network: string, callData: HexString) => {
      open(
        <SubApiRoot defaultNetwork={network}>
          <Template defaultCallData={callData} defaultAdded onClose={close} />
        </SubApiRoot>
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
        className='border-secondary'
        color='primary'
        variant='ghost'
        radius='md'
        onPress={() => {
          if (isOpen) {
            close();
          } else {
            open(
              <SubApiRoot>
                <Template onClose={close} />
              </SubApiRoot>
            );
          }
        }}
      >
        <IconTemplate />
      </Button>
    </Tooltip>
  );
}

export default React.memo(TemplateButton);
