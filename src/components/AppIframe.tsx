// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { MutableRefObject } from 'react';

import { Box } from '@mui/material';
import React from 'react';

type AppIframeProps = {
  appUrl: string;
  allowedFeaturesList?: string;
  title?: string;
  iframeRef?: MutableRefObject<HTMLIFrameElement | null>;
  onLoad?: () => void;
};

// see sandbox mdn docs for more details https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#attr-sandbox
const IFRAME_SANDBOX_ALLOWED_FEATURES =
  'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms allow-downloads allow-orientation-lock allow-storage-access-by-user-activation';

function AppIframe({ allowedFeaturesList = 'camera', appUrl, iframeRef, onLoad, title }: AppIframeProps) {
  return (
    <Box
      allow={allowedFeaturesList}
      component='iframe'
      id={`iframe-${appUrl}`}
      onLoad={onLoad}
      ref={iframeRef}
      sandbox={IFRAME_SANDBOX_ALLOWED_FEATURES}
      src={appUrl}
      sx={{
        height: '100%',
        width: '100%',
        overflow: 'auto',
        boxSizing: 'border-box',
        border: 'none'
      }}
      title={title}
    />
  );
}

export default React.memo(AppIframe);
