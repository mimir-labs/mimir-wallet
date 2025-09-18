// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { type DappOption, dapps } from '@/config';
import { useOpenDapp } from '@/hooks/useOpenDapp';
import { useMemo } from 'react';

import { Button, Chip } from '@mimir-wallet/ui';

// MatchedApps component based on Figma design
function MatchedApps({ apps }: { eventId: string; apps: { id: string; tag?: string; path?: string }[] }) {
  const list = useMemo(() => {
    const result = [];

    for (const { id, tag, path } of apps) {
      const dapp = dapps.find((item) => item.id.toString() === id);

      if (dapp) {
        result.push({ dapp, tag, path });
      }
    }

    return result;
  }, [apps]);

  return (
    <div className='flex w-full flex-col items-start gap-[5px]'>
      {/* Title */}
      <div className='text-foreground text-[14px] font-normal'>Matched Apps ({list.length})</div>

      {/* Apps list */}
      {list.map((app) => (
        <MatchedAppItem key={app.dapp.id} {...app.dapp} path={app.path} tag={app.tag} />
      ))}
    </div>
  );
}

// Individual app item component
function MatchedAppItem(dapp: DappOption & { path?: string; tag?: string }) {
  const { name, icon, tag, path } = dapp;
  const openDapp = useOpenDapp(dapp);

  return (
    <div className='border-divider-300 flex w-full items-center justify-between rounded-[10px] border p-2.5'>
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
