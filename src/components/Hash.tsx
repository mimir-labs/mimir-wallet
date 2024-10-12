// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

import { Box, IconButton, SvgIcon } from '@mui/material';
import React from 'react';

import IconLink from '@mimir-wallet/assets/svg/icon-link.svg?react';
import { chainLinks } from '@mimir-wallet/utils';

import CopyButton from './CopyButton';

interface Props {
  value?: string | HexString;
  withExplorer?: boolean;
  withCopy?: boolean;
}

function Hash({ value, withCopy, withExplorer }: Props) {
  const stringValue = value?.toString();

  return (
    <Box
      component='a'
      sx={{
        display: 'inline-flex',
        gap: 0.4,
        alignItems: 'center',
        textDecoration: 'none',
        color: 'inherit',
        ':hover': withExplorer ? { textDecoration: 'underline' } : {}
      }}
      href={withExplorer ? chainLinks.extrinsicExplorerLink(stringValue) : undefined}
      target='_blank'
    >
      {stringValue}
      {withCopy && <CopyButton sx={{ padding: 0 }} size='small' value={stringValue} />}
      {withExplorer && (
        <IconButton color='inherit' size='small' sx={{ padding: 0 }}>
          <SvgIcon component={IconLink} inheritViewBox />
        </IconButton>
      )}
    </Box>
  );
}

export default React.memo(Hash);
