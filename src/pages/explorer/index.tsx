// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AppIframe } from '@mimir-wallet/components';
import { useApi, useSelectedAccount } from '@mimir-wallet/hooks';
import { CircularProgress, Stack } from '@mui/material';
import { useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import PendingTx from './PendingTx';
import { useCommunicator } from './useCommunicator';

function PageExplorer() {
  const { url } = useParams<'url'>();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const { apiUrl } = useApi();
  const [loading, setLoading] = useState(true);
  const selected = useSelectedAccount();

  const appUrl = useMemo(() => {
    return `${url}?rpc=${encodeURIComponent(apiUrl)}`;
  }, [apiUrl, url]);

  useCommunicator(iframeRef, appUrl);

  return (
    <Stack key={selected || 'none'} sx={{ height: '100%', position: 'relative', paddingBottom: '60px' }}>
      {loading && <CircularProgress sx={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, margin: 'auto' }} />}
      {url && <AppIframe appUrl={appUrl} iframeRef={iframeRef} key={url} onLoad={() => setLoading(false)} />}
      {url && selected && <PendingTx address={selected} url={url} />}
    </Stack>
  );
}

export default PageExplorer;
