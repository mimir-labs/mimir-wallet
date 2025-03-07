// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import lottie, { type AnimationItem } from 'lottie-web';
import { useEffect, useRef } from 'react';

import DataJson from './lottie-congrats.json';

function Congrats() {
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

  return <div ref={container} style={{ width: 280, height: 280 }} />;
}

export default Congrats;
