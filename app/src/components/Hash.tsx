// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

import { chainLinks, useNetwork } from '@mimir-wallet/polkadot-core';
import { Button } from '@mimir-wallet/ui';
import React from 'react';

import CopyButton from './CopyButton';

import IconLink from '@/assets/svg/icon-link.svg?react';

interface Props {
  value?: string | HexString;
  withExplorer?: boolean;
  withCopy?: boolean;
}

function Hash({ value, withCopy, withExplorer }: Props) {
  const { chain } = useNetwork();
  const stringValue = value?.toString();

  const explorerLink = withExplorer
    ? chainLinks.extrinsicExplorerLink(chain, stringValue)
    : undefined;

  const C = explorerLink ? 'a' : 'span';

  return (
    <C
      data-link={!!explorerLink}
      className='flex items-center gap-1 text-[length:inherit] text-inherit no-underline data-[link="true"]:hover:underline'
      href={explorerLink}
      target={explorerLink ? '_blank' : undefined}
      rel={explorerLink ? 'noopener noreferrer' : undefined}
    >
      <>
        {`${stringValue?.slice(0, 8)}…${stringValue?.slice(-8)}`}
        {withCopy && <CopyButton size="sm" value={stringValue} />}
        {explorerLink && (
          <Button
            isIconOnly
            size="sm"
            variant="light"
            className="h-5 min-h-[0px] w-5 min-w-[0px] text-inherit opacity-50"
          >
            <IconLink className="h-4 w-4" />
          </Button>
        )}
      </>
    </C>
  );
}

export default React.memo(Hash);
