// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useSelectedAccount } from '@/accounts/useSelectedAccount';
import { AppIframe } from '@/components';
import { useMemo, useRef, useState } from 'react';

import { Spinner } from '@mimir-wallet/ui';

import PendingTx from './PendingTx';
import { useCommunicator } from './useCommunicator';

function AppFrame({ url, iconUrl, appName }: { url: string; iconUrl?: string; appName?: string }) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [loading, setLoading] = useState(true);
  const selected = useSelectedAccount();

  const appUrl = useMemo(() => {
    return `${url}`;
  }, [url]);

  useCommunicator(iframeRef, appUrl, iconUrl, appName);

  return (
    <div key={selected || 'none'} className='h-full relative'>
      {loading && <Spinner size='lg' variant='wave' className='absolute left-0 top-0 right-0 bottom-0 m-auto' />}
      {url && <AppIframe appUrl={appUrl} iframeRef={iframeRef} key={url} onLoad={() => setLoading(false)} />}
      {url && selected && <PendingTx address={selected} url={url} />}
    </div>
  );
}

export default AppFrame;
