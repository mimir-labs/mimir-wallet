// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import lottie, { AnimationItem } from 'lottie-web';
import { useEffect, useRef } from 'react';

import DataJson from './lottie-loading.json';

function MimirLoading() {
  const container = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let animation: AnimationItem | null = null;

    if (container.current) {
      animation = lottie.loadAnimation({
        container: container.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData: DataJson
      });
    }

    return () => {
      animation?.destroy();
    };
  }, []);

  return <div ref={container} style={{ width: 160, height: 100 }} />;
}

export default MimirLoading;
