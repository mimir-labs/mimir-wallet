// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Dialog } from '@mui/material';
import { isHex, isString } from '@polkadot/util';
import React, { useMemo } from 'react';
import ReactJson from 'react-json-view';
import { useToggle } from 'react-use';

import { Bytes } from '@mimir-wallet/components';

import { ParamProps } from './types';

function Unknown({ name, value }: ParamProps) {
  const [open, toggleOpen] = useToggle(false);

  const human = useMemo(() => {
    return value.toHuman();
  }, [value]);

  if (isHex(human)) {
    return <Bytes value={human} />;
  }

  if (isString(human)) {
    return human.toString().slice(0, 32);
  }

  return (
    <span onClick={(e) => e.stopPropagation()}>
      <Box
        component='span'
        sx={{ cursor: 'pointer', color: 'primary.main', fontSize: '0.75rem', fontWeight: 700 }}
        onClick={toggleOpen}
      >
        View {name || 'Details'}
      </Box>

      <Dialog fullWidth maxWidth='sm' open={open} onClose={toggleOpen}>
        <ReactJson enableClipboard indentWidth={2} src={value.toHuman() as any} theme='summerfruit:inverted' />
      </Dialog>
    </span>
  );
}

export default React.memo(Unknown);
