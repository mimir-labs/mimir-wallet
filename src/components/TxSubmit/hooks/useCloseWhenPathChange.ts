// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export function useCloseWhenPathChange(onClose?: () => void) {
  const { pathname } = useLocation();
  const lastPath = useRef(pathname);

  useEffect(() => {
    if (pathname !== lastPath.current) {
      onClose?.();
    }

    lastPath.current = pathname;
  }, [onClose, pathname]);

  useEffect(() => {
    window.onbeforeunload = function onbeforeunload() {
      return 'Closing this window will discard your current progress';
    };

    return () => {
      window.onbeforeunload = null;
    };
  }, []);
}
