// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AnimatePresence, motion } from 'framer-motion';
import React, { useState } from 'react';
import { createPortal } from 'react-dom';

import DraggableChatWindow from './DraggableChatWindow';
import MimoLogo from './MimoLogo';

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

  // Don't show FAB on mobile if disabled
  if (!showFABOnMobile) {
    return null;
  }

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
    setIsOpen(true);
    onOpen?.();
  };

  // Debug function to reset position (can be called in console)
  if (typeof window !== 'undefined') {
    (window as any).resetChatPosition = () => {
      localStorage.removeItem('draggable-chat-position');
      console.log('Chat position reset. Close and reopen the chat to see the change.');
    };
  }

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  return (
    <>
      {/* Floating Action Button */}
      {createPortal(
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 17
              }}
              onClick={handleOpen}
              className={`fixed z-50 duration-200 ${fabClassName} `}
              style={{
                filter: 'drop-shadow(0 0 30px rgba(0, 82, 255, 0.25))',
                bottom: typeof fabPosition.bottom === 'number' ? `${fabPosition.bottom}px` : fabPosition.bottom,
                right: typeof fabPosition.right === 'number' ? `${fabPosition.right}px` : fabPosition.right
              }}
              aria-label='Open AI Assistant'
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
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
