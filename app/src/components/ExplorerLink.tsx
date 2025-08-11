// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import StatescanImg from '@/assets/images/statescan.svg';
import SubscanImg from '@/assets/images/subscan.svg';
import { useMemo } from 'react';

import { chainLinks, type Endpoint } from '@mimir-wallet/polkadot-core';
import { Avatar, Tooltip } from '@mimir-wallet/ui';

interface ExplorerLinkProps {
  address: string;
  showAll?: boolean; // false: only show first one (Subscan priority), true: show all
  className?: string;
  iconSize?: number | string;
  chain: Endpoint;
}

interface ExplorerItem {
  type: 'subscan' | 'statescan';
  url: string;
  icon: string;
  tooltip: string;
}

function ExplorerLink({ address, showAll = false, className, chain, iconSize = 20 }: ExplorerLinkProps) {
  const explorerItems = useMemo<ExplorerItem[]>(() => {
    if (!address) return [];

    const items: ExplorerItem[] = [];

    // Priority: Subscan first, then Statescan
    if (chain.explorerUrl) {
      const url = chainLinks.accountExplorerLink(
        { ss58Format: chain.ss58Format, explorerUrl: chain.explorerUrl },
        address
      );

      if (url) {
        items.push({
          type: 'subscan',
          url,
          icon: SubscanImg,
          tooltip: 'Subscan'
        });
      }
    }

    if (chain.statescanUrl) {
      const url = chainLinks.accountExplorerLink(
        { ss58Format: chain.ss58Format, statescanUrl: chain.statescanUrl },
        address
      );

      if (url) {
        items.push({
          type: 'statescan',
          url,
          icon: StatescanImg,
          tooltip: 'Statescan'
        });
      }
    }

    return items;
  }, [chain, address]);

  const displayItems = showAll ? explorerItems : explorerItems.slice(0, 1);

  if (displayItems.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center gap-1 sm:gap-2 ${className || ''}`}>
      {displayItems.map((item) => (
        <Tooltip key={item.type} content={item.tooltip}>
          <a target='_blank' href={item.url} rel='noopener noreferrer'>
            <Avatar
              style={{ width: iconSize, height: iconSize, backgroundColor: 'transparent' }}
              src={item.icon}
              alt={item.type}
            />
          </a>
        </Tooltip>
      ))}
    </div>
  );
}

export default ExplorerLink;
