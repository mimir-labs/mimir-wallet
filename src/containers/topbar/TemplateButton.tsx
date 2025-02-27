// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

import { IconButton, SvgIcon, Tooltip } from '@mui/material';
import React, { useEffect } from 'react';

import IconTemplate from '@mimir-wallet/assets/svg/icon-template.svg?react';
import { events } from '@mimir-wallet/events';
import Template from '@mimir-wallet/features/template';

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
      open(<Template onClose={close} />);
    };

    const onAdd = (callData: HexString) => {
      open(<Template defaultCallData={callData} defaultAdded onClose={close} />);
    };

    events.on('template_open', onOpen);
    events.on('template_add', onAdd);

    return () => {
      events.off('template_open', onOpen);
      events.off('template_add', onAdd);
    };
  }, [open, close]);

  return (
    <Tooltip title='Template'>
      <IconButton
        sx={{
          border: '1px solid',
          borderColor: 'secondary.main',
          borderRadius: 1,
          ':hover': { bgcolor: 'primary.main', color: 'primary.contrastText' }
        }}
        color='primary'
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();

          if (isOpen) {
            close();
          } else {
            open(<Template onClose={close} />);
          }
        }}
      >
        <SvgIcon inheritViewBox component={IconTemplate} />
      </IconButton>
    </Tooltip>
  );
}

export default React.memo(TemplateButton);
