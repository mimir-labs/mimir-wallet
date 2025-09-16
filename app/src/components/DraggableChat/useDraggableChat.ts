// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useRef, useState } from 'react';

interface Position {
  x: number;
  y: number;
}

interface UseDraggableChatOptions {
  initialPosition?: Position;
  width?: number;
  height?: number;
}

export function useDraggableChat({ initialPosition, width = 395, height = 600 }: UseDraggableChatOptions = {}) {
  // Load saved position from localStorage or use initial position
  const [position, setPosition] = useState<Position>(() => {
    if (typeof window === 'undefined') return { x: 100, y: 100 };

    return initialPosition || { x: 100, y: 100 };
  });

  // Calculate drag constraints for framer-motion
  const [dragConstraints, setDragConstraints] = useState({
    left: 0,
    right: 0,
    top: 0,
    bottom: 0
  });

  const containerRef = useRef<HTMLDivElement>(null);

  // Update constraints when window resizes or component mounts
  useEffect(() => {
    const updateConstraints = () => {
      if (typeof window !== 'undefined') {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        // Set constraints for framer-motion drag
        setDragConstraints({
          left: 0,
          right: Math.max(0, windowWidth - width),
          top: 0,
          bottom: Math.max(0, windowHeight - height)
        });

        // Validate current position and fix if needed
        const maxX = Math.max(0, windowWidth - width);
        const maxY = Math.max(0, windowHeight - height);

        const validatedPosition = {
          x: Math.max(0, Math.min(position.x, maxX)),
          y: Math.max(0, Math.min(position.y, maxY))
        };

        if (validatedPosition.x !== position.x || validatedPosition.y !== position.y) {
          setPosition(validatedPosition);
        }
      }
    };

    updateConstraints();
    window.addEventListener('resize', updateConstraints);

    return () => window.removeEventListener('resize', updateConstraints);
  }, [width, height, position.x, position.y]);

  // Handle drag end for framer-motion
  const handleDragEnd = (_event: any, info: any) => {
    const newPosition = {
      x: position.x + info.offset.x,
      y: position.y + info.offset.y
    };

    // Ensure position is within bounds
    if (typeof window !== 'undefined') {
      const maxX = Math.max(0, window.innerWidth - width);
      const maxY = Math.max(0, window.innerHeight - height);

      newPosition.x = Math.max(0, Math.min(newPosition.x, maxX));
      newPosition.y = Math.max(0, Math.min(newPosition.y, maxY));
    }

    setPosition(newPosition);
  };

  return {
    position,
    dragConstraints,
    containerRef,
    handleDragEnd
  };
}
