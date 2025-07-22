// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

import IconLink from '@/assets/svg/icon-link.svg?react';
import React from 'react';

import { chainLinks, useApi } from '@mimir-wallet/polkadot-core';
import { Button, Link } from '@mimir-wallet/ui';

import CopyButton from './CopyButton';

interface Props {
  value?: string | HexString;
  withExplorer?: boolean;
  withCopy?: boolean;
}

function Hash({ value, withCopy, withExplorer }: Props) {
  const { chain } = useApi();
  const stringValue = value?.toString();

  const explorerLink = withExplorer ? chainLinks.extrinsicExplorerLink(chain, stringValue) : undefined;

  const C = explorerLink ? Link : 'span';

  return (
    <C
      data-link={!!explorerLink}
      className='flex items-center gap-1 text-[length:inherit] text-inherit no-underline data-[link="true"]:hover:underline'
      href={explorerLink}
      target='_blank'
    >
      <>
        {`${stringValue?.slice(0, 8)}…${stringValue?.slice(-8)}`}
        {withCopy && <CopyButton size='sm' value={stringValue} />}
        {explorerLink && (
          <Button
            color='default'
            isIconOnly
            size='sm'
            variant='light'
            className='h-5 min-h-[0px] w-5 min-w-[0px] opacity-50'
          >
            <IconLink className='h-4 w-4' />
          </Button>
        )}
      </>
    </C>
  );
}

export default React.memo(Hash);
