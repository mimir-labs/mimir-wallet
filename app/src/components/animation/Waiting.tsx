// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import lottie, { type AnimationItem } from 'lottie-web';
import { useEffect, useRef } from 'react';

import DataJson from './lottie-waiting.json';

function Waiting({ size = 28, loop = false }: { size?: number; loop?: boolean }) {
  const container = useRef(null);

  useEffect(() => {
    let animation: AnimationItem | null = null;

    if (container.current) {
      animation = lottie.loadAnimation({
        container: container.current,
        renderer: 'svg',
        loop,
        autoplay: true,
        animationData: DataJson
      });
    }

    return () => {
      animation?.destroy();
    };
  }, [loop]);

  return <div ref={container} style={{ width: size, height: size }} />;
}

export default Waiting;
