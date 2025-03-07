// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect } from 'react';

const TITLE_PREFIX = '‼️ New Pending Transaction';

const setDocumentTitle = (isPrefixed: boolean) => {
  document.title = isPrefixed ? TITLE_PREFIX + document.title : document.title.replace(TITLE_PREFIX, '');
};

const blinkFavicon = (
  _favicon: HTMLLinkElement | null,
  _originalHref: string,
  isBlinking = false
): ReturnType<typeof setInterval> => {
  let _isBlinking = isBlinking;

  const onBlink = () => {
    setDocumentTitle(_isBlinking);
    _isBlinking = !_isBlinking;
  };

  onBlink();

  return setInterval(onBlink, 300);
};

/**
 * Blink favicon when the tab is hidden
 */
export function useHighlightTab() {
  useEffect(() => {
    const favicon = document.querySelector<HTMLLinkElement>('link[rel*="icon"]');
    const originalHref = favicon?.href || '';
    let interval: ReturnType<typeof setInterval>;

    const reset = () => {
      clearInterval(interval);
      setDocumentTitle(false);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        interval = blinkFavicon(favicon, originalHref);
      } else {
        reset();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    handleVisibilityChange();

    return () => {
      reset();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
}
