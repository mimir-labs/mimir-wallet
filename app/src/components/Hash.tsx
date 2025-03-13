// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

import { chainLinks } from '@/api/chain-links';
import IconLink from '@/assets/svg/icon-link.svg?react';
import { IconButton, SvgIcon, useMediaQuery, useTheme } from '@mui/material';
import React from 'react';

import CopyButton from './CopyButton';

interface Props {
  value?: string | HexString;
  withExplorer?: boolean;
  withCopy?: boolean;
}

function Hash({ value, withCopy, withExplorer }: Props) {
  const stringValue = value?.toString();
  const { breakpoints } = useTheme();
  const downSm = useMediaQuery(breakpoints.down('sm'));

  const explorerLink = withExplorer ? chainLinks.extrinsicExplorerLink(stringValue) : undefined;

  const C = explorerLink ? 'a' : 'span';

  return (
    <C
      data-link={explorerLink}
      className='flex gap-1 items-center no-underline text-inherit data-[link="true"]:hover:underline'
      href={explorerLink}
      target='_blank'
    >
      <>
        {downSm ? `${stringValue?.slice(0, 8)}...${stringValue?.slice(-8)}` : stringValue}
        {withCopy && <CopyButton size='sm' value={stringValue} />}
        {explorerLink && (
          <IconButton color='inherit' size='small' sx={{ padding: 0 }}>
            <SvgIcon component={IconLink} inheritViewBox />
          </IconButton>
        )}
      </>
    </C>
  );
}

export default React.memo(Hash);
