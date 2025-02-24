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
  setElement,
  open,
  close
}: {
  isOpen: boolean;
  setElement: (element: React.ReactNode) => void;
  open: () => void;
  close: () => void;
}) {
  useEffect(() => {
    const onOpen = () => {
      setElement(<Template />);
      open();
    };

    const onAdd = (callData: HexString) => {
      setElement(<Template defaultCallData={callData} defaultAdded />);
      open();
    };

    events.on('template_open', onOpen);
    events.on('template_add', onAdd);

    return () => {
      events.off('template_open', onOpen);
      events.off('template_add', onAdd);
    };
  }, [open, setElement]);

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
          setElement(<Template />);

          if (isOpen) {
            close();
          } else {
            open();
          }
        }}
      >
        <SvgIcon inheritViewBox component={IconTemplate} />
      </IconButton>
    </Tooltip>
  );
}

export default React.memo(TemplateButton);
