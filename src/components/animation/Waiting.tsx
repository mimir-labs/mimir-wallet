// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box } from '@mui/material';
import lottie, { AnimationItem } from 'lottie-web';
import { useEffect, useRef } from 'react';

import DataJson from './waiting.json';

function Waiting({ size = 28 }: { size?: number }) {
  const container = useRef<HTMLDivElement>();

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

  return <Box ref={container} sx={{ width: size, height: size }} />;
}

export default Waiting;
