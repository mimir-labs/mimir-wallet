// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { type DappOption, dapps } from '@/config';
import { useOpenDapp } from '@/hooks/useOpenDapp';
import { useMemo } from 'react';

import { Button, Chip } from '@mimir-wallet/ui';

// MatchedApps component based on Figma design
function MatchedApps({ apps }: { eventId: string; apps: { id: string; path?: string }[] }) {
  const list = useMemo(() => {
    const result = [];

    for (const { id, path } of apps) {
      const dapp = dapps.find((item) => item.id.toString() === id);

      if (dapp) {
        result.push({ dapp, path });
      }
    }

    return result;
  }, [apps]);

  return (
    <div className='flex w-full flex-col items-start gap-[5px]'>
      {/* Title */}
      <div className='text-foreground text-[14px] font-normal'>Matched Apps ({list.length})</div>

      {/* Apps list */}
      {list.map((app, index) => (
        <MatchedAppItem key={index} {...app.dapp} path={app.path} />
      ))}
    </div>
  );
}

// Individual app item component
function MatchedAppItem(dapp: DappOption & { path?: string }) {
  const { name, icon, path } = dapp;
  const openDapp = useOpenDapp(dapp);

  const tag = path?.split('/').at(-1);

  return (
    <div
      onClick={() => openDapp(path)}
      className='border-divider-300 hover:border-primary focus-visible:border-primary focus-visible:ring-primary/30 flex w-full cursor-pointer items-center justify-between rounded-[10px] border p-2.5 transition-colors focus-visible:ring-2 focus-visible:outline-none'
    >
      {/* Left side: Icon and name */}
      <div className='flex items-center gap-2.5'>
        <img src={icon} alt={name} className='h-[30px] w-[30px] rounded-full' />
        <div className='text-foreground text-[14px] font-bold'>{name}</div>
      </div>
      {tag && <Chip color='secondary'>{tag}</Chip>}

      {/* Right side: View button */}
      <Button
        size='sm'
        color='secondary'
        onClick={() => {
          openDapp(path);
        }}
      >
        View
      </Button>
    </div>
  );
}

export default MatchedApps;
