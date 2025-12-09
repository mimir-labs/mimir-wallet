// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AnimationItem } from 'lottie-web';

import { useEffect, useRef } from 'react';

import DataJson from './lottie-failed.json';

function Failed({ size = 28 }: { size?: number }) {
  const container = useRef(null);

  useEffect(() => {
    let animation: Promise<AnimationItem | null> | null = null;

    animation = import('lottie-web').then((lottie) => {
      if (container.current) {
        return lottie.default.loadAnimation({
          container: container.current,
          renderer: 'svg',
          loop: false,
          autoplay: true,
          animationData: DataJson,
        });
      }

      return null;
    });

    return () => {
      animation.then((anim) => anim?.destroy());
    };
  }, []);

  return <div ref={container} style={{ width: size, height: size }} />;
}

export default Failed;
