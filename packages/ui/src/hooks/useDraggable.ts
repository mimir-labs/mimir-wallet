// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect, useRef, useState } from 'react';

export interface Position {
  x: number;
  y: number;
}

export interface Bounds {
  width: number;
  height: number;
}

export interface DragConstraints {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export interface UseDraggableOptions {
  initialPosition?: Position;
  bounds: Bounds;
  margin?: number;
}

export interface UseDraggableReturn<T extends HTMLElement = HTMLElement> {
  position: Position;
  dragConstraints: DragConstraints;
  containerRef: React.RefObject<T>;
  handleDragEnd: (event: any, info: any) => void;
}

/**
 * A universal draggable hook for framer-motion drag functionality
 * Supports both square elements (FAB buttons) and rectangular elements (chat windows)
 */
export function useDraggable<T extends HTMLElement = HTMLElement>({
  initialPosition = { x: 24, y: 24 },
  bounds,
  margin = 0
}: UseDraggableOptions): UseDraggableReturn<T> {
  const clamp = useCallback((value: number, min: number, max: number) => {
    if (Number.isNaN(value)) return min;

    return Math.min(Math.max(value, min), max);
  }, []);

  // Initialize position state
  const [position, setPosition] = useState<Position>(() => {
    if (typeof window === 'undefined') {
      return initialPosition;
    }

    return initialPosition;
  });

  // Calculate drag constraints for framer-motion
  const [dragConstraints, setDragConstraints] = useState<DragConstraints>({
    left: 0,
    right: 0,
    top: 0,
    bottom: 0
  });

  const containerRef = useRef<T>(null);

  // Update constraints when window resizes or component mounts
  useEffect(() => {
    const updateConstraints = () => {
      if (typeof window !== 'undefined') {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        // Calculate max positions
        const maxX = Math.max(margin, windowWidth - bounds.width - margin);
        const maxY = Math.max(margin, windowHeight - bounds.height - margin);

        // Set constraints for framer-motion drag
        setDragConstraints({
          left: margin,
          right: maxX,
          top: margin,
          bottom: maxY
        });

        // Validate current position and fix if needed
        const validatedPosition = {
          x: clamp(position.x, margin, maxX),
          y: clamp(position.y, margin, maxY)
        };

        if (validatedPosition.x !== position.x || validatedPosition.y !== position.y) {
          setPosition(validatedPosition);
        }
      }
    };

    updateConstraints();
    window.addEventListener('resize', updateConstraints);

    return () => window.removeEventListener('resize', updateConstraints);
  }, [bounds.width, bounds.height, margin, position.x, position.y, clamp]);

  // Handle drag end for framer-motion
  const handleDragEnd = useCallback(
    (_event: any, info: any) => {
      const newPosition = {
        x: position.x + info.offset.x,
        y: position.y + info.offset.y
      };

      // Ensure position is within bounds
      if (typeof window !== 'undefined') {
        const maxX = Math.max(margin, window.innerWidth - bounds.width - margin);
        const maxY = Math.max(margin, window.innerHeight - bounds.height - margin);

        newPosition.x = clamp(newPosition.x, margin, maxX);
        newPosition.y = clamp(newPosition.y, margin, maxY);
      }

      setPosition(newPosition);
    },
    [position.x, position.y, bounds.width, bounds.height, margin, clamp]
  );

  return {
    position,
    dragConstraints,
    containerRef,
    handleDragEnd
  };
}

// Convenience hooks for common use cases

/**
 * Hook for square draggable elements like FAB buttons
 */
export function useDraggableSquare<T extends HTMLElement = HTMLElement>({
  initialPosition,
  size = 60,
  margin = 8
}: {
  initialPosition?: Position;
  size?: number;
  margin?: number;
} = {}) {
  return useDraggable<T>({
    initialPosition,
    bounds: { width: size, height: size },
    margin
  });
}

/**
 * Hook for rectangular draggable elements like chat windows
 */
export function useDraggableRectangle<T extends HTMLElement = HTMLElement>({
  initialPosition,
  width = 395,
  height = 600,
  margin = 0
}: {
  initialPosition?: Position;
  width?: number;
  height?: number;
  margin?: number;
} = {}) {
  return useDraggable<T>({
    initialPosition,
    bounds: { width, height },
    margin
  });
}
