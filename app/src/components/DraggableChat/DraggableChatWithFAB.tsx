// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AnimatePresence, motion, useDragControls } from 'framer-motion';
import React, { useCallback, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

import DraggableChatWindow from './DraggableChatWindow';
import MimoLogo from './MimoLogo';
import { useDraggableFAB } from './useDraggableFAB';

export interface DraggableChatWithFABProps {
  // FAB button position
  fabPosition?: {
    bottom?: number | string;
    right?: number | string;
  };
  // FAB button custom className
  fabClassName?: string;
  // Initial chat window position
  initialChatPosition?: { x: number; y: number };
  // Callbacks
  onOpen?: () => void;
  onClose?: () => void;
  // Whether to show FAB on mobile
  showFABOnMobile?: boolean;
}

function DraggableChatWithFAB({
  fabPosition = { bottom: 24, right: 24 },
  fabClassName = '',
  initialChatPosition,
  onOpen,
  onClose,
  showFABOnMobile = true
}: DraggableChatWithFABProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const dragControls = useDragControls();

  // Calculate initial FAB position from fabPosition prop
  const calculateInitialPosition = useCallback(() => {
    if (typeof window === 'undefined') return { x: 24, y: 24 };

    const bottom = typeof fabPosition.bottom === 'number' ? fabPosition.bottom : 24;
    const right = typeof fabPosition.right === 'number' ? fabPosition.right : 24;

    return {
      x: window.innerWidth - right - 60, // 60 is FAB size
      y: window.innerHeight - bottom - 60
    };
  }, [fabPosition.bottom, fabPosition.right]);

  const { position, dragConstraints, containerRef, handleDragEnd } = useDraggableFAB({
    initialPosition: calculateInitialPosition()
  });

  // Calculate dynamic height: half of screen height, minimum 600px, but if screen height < 600, use screen height
  const calculateHeight = () => {
    if (typeof window === 'undefined') return 600;

    const screenHeight = window.innerHeight;
    const halfScreenHeight = screenHeight / 2;

    if (screenHeight < 600) {
      return screenHeight;
    }

    return Math.max(600, halfScreenHeight);
  };

  // Calculate chat window initial position based on FAB position
  const calculateChatPosition = () => {
    if (initialChatPosition) return initialChatPosition;

    // Position chat window near the FAB
    const bottomValue = typeof fabPosition.bottom === 'number' ? fabPosition.bottom : 24;
    const rightValue = typeof fabPosition.right === 'number' ? fabPosition.right : 24;
    const dynamicHeight = calculateHeight();

    return {
      x: Math.max(0, window.innerWidth - 395 - rightValue - 20), // 20px gap from FAB
      y: Math.max(0, window.innerHeight - dynamicHeight - bottomValue - 20) // 20px gap from FAB
    };
  };

  const handleOpen = () => {
    if (isDragging) {
      return;
    }

    setIsOpen(true);
    onOpen?.();
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  const fabStyle = useMemo(() => {
    return {
      filter: 'drop-shadow(0 0 30px rgba(0, 82, 255, 0.25))',
      x: position.x,
      y: position.y
    } as React.CSSProperties;
  }, [position.x, position.y]);

  // Don't show FAB on mobile if disabled
  if (!showFABOnMobile) {
    return null;
  }

  return (
    <>
      {/* Floating Action Button */}
      {createPortal(
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              ref={containerRef}
              onClick={handleOpen}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className={`fixed top-0 z-50 ${fabClassName} `}
              style={fabStyle}
              aria-label='Open AI Assistant'
              drag
              dragControls={dragControls}
              dragConstraints={dragConstraints}
              dragElastic={0}
              dragMomentum={false}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={(event, info) => {
                setIsDragging(false);
                handleDragEnd(event, info);
              }}
              dragListener={false}
              onPointerDown={(e) => {
                // Prevent click when starting drag
                e.preventDefault();
                dragControls.start(e);
              }}
            >
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={
                  isDragging
                    ? { opacity: 1, scale: 1, rotate: 0 }
                    : isHovered
                      ? { opacity: 1, scale: 1, rotate: 0 }
                      : { opacity: 1, scale: 1, rotate: [0, 10, -10, 0] }
                }
                exit={{ scale: 0, opacity: 0 }}
                transition={
                  isDragging || isHovered
                    ? { duration: 0.2, opacity: { duration: 0.2 }, scale: { duration: 0.2 } }
                    : {
                        opacity: { duration: 0.2 },
                        scale: { duration: 0.2 },
                        rotate: {
                          duration: 3,
                          repeat: Infinity,
                          repeatDelay: 2
                        }
                      }
                }
              >
                <MimoLogo size={50} />
              </motion.div>
            </motion.button>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Draggable Chat Window */}
      <DraggableChatWindow isOpen={isOpen} onClose={handleClose} initialPosition={calculateChatPosition()} />
    </>
  );
}

export default React.memo(DraggableChatWithFAB);
