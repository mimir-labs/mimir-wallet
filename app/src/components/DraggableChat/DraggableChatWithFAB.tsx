// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AnimatePresence, motion, useDragControls } from 'framer-motion';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { useDraggable } from '@mimir-wallet/ui';

import DraggableChatWindow, { type DraggableChatWindowRef } from './DraggableChatWindow';
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
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [chatStatus, setChatStatus] = useState<'ready' | 'streaming' | 'submitted' | 'error'>('ready');
  const [hasNewReply, setHasNewReply] = useState(false);
  const chatWindowRef = useRef<DraggableChatWindowRef>(null);

  // Define suggestions and randomly select 3: one from each group
  const suggestions = useMemo(() => {
    const allSuggestions: Record<string, string> = {
      'Create a multisig': 'Help me create a new multisig',
      'Initiate a transfer': 'Help me initiate a new transfer',
      'Create a proxy': 'Help me create a new proxy',
      'Call Template': "What is Mimir's call template?",
      'Batch Transaction': "What is Mimir's call Batch transaction?",
      'Set Proposer': 'What is proposer?',
      'Stake DOT': 'i want to stake dot',
      'Participate OpenGov': 'i want to vote in OpenGov',
      'Use Hydration App': 'I want to user Hydration App'
    };

    const suggestionEntries = Object.entries(allSuggestions);
    const group1 = suggestionEntries.slice(0, 3); // indices 0-2
    const group2 = suggestionEntries.slice(3, 6); // indices 3-5
    const group3 = suggestionEntries.slice(6, 9); // indices 6-8

    const pickRandom = <T,>(items: T[]) =>
      items.length > 0 ? items[Math.floor(Math.random() * items.length)] : undefined;

    const selected = [pickRandom(group1), pickRandom(group2), pickRandom(group3)];

    return selected.filter(Boolean) as Array<[string, string]>;
  }, []); // Empty dependency array means suggestions are selected once when component mounts

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

  const { position, dragConstraints, containerRef, handleDragEnd } = useDraggable({
    initialPosition: calculateInitialPosition(),
    bounds: { width: 60, height: 60 }, // Use max size for bounds
    margin: 8
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
    setIsHovered(false);
    setHasNewReply(false); // Clear new reply indicator when opening chat
    onOpen?.();
  };

  const handleStatusChange = (status: 'ready' | 'streaming' | 'submitted' | 'error') => {
    const prevStatus = chatStatus;

    setChatStatus(status);

    // If chat is closed and status changed from streaming/submitted to ready, mark as new reply
    if (!isOpen && (prevStatus === 'streaming' || prevStatus === 'submitted') && status === 'ready') {
      setHasNewReply(true);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (isOpen) {
      // If chat is already open, send the message directly
      chatWindowRef.current?.sendMessage(suggestion);
    } else {
      // If chat is closed, open it first then send the message
      handleOpen();
      // Wait for the chat to be fully open before sending the message
      setTimeout(() => {
        chatWindowRef.current?.sendMessage(suggestion);
      }, 300); // Small delay to ensure chat is mounted
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  // Don't show FAB on mobile if disabled
  if (!showFABOnMobile) {
    return null;
  }

  return (
    <>
      {/* Floating Action Button with Suggestions */}
      {createPortal(
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              ref={containerRef as any}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className={`fixed top-0 z-50 ${fabClassName}`}
              style={{
                x: position.x,
                y: position.y
              }}
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
                dragControls.start(e);
              }}
            >
              {/* Container for status and suggestions */}
              <motion.div className='absolute right-0 bottom-full flex flex-col items-end gap-[5px] pb-[5px]'>
                {/* Suggestion Buttons - only show on hover */}
                <AnimatePresence>
                  {isHovered && !isDragging && (
                    <>
                      {suggestions.map(([label, value], index) => (
                        <motion.button
                          key={label}
                          onClick={() => handleSuggestionClick(value)}
                          className='border-primary/20 bg-card text-primary hover:bg-secondary rounded-full border px-[15px] py-[5px] text-[12px] text-nowrap shadow-[0px_0px_10px_0px_rgba(0,82,255,0.15)] transition-colors'
                          initial={{ opacity: 0, x: 20, scale: 0.8 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          exit={{ opacity: 0, x: 20, scale: 0.8 }}
                          transition={{
                            delay: index * 0.05,
                            duration: 0.2,
                            type: 'spring',
                            damping: 20,
                            stiffness: 300
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {label}
                        </motion.button>
                      ))}
                    </>
                  )}
                </AnimatePresence>

                {/* Status Indicator - always visible when thinking or has new reply */}
                <AnimatePresence>
                  {(chatStatus === 'streaming' || chatStatus === 'submitted' || hasNewReply) && !isDragging && (
                    <motion.div
                      className='border-primary/20 bg-card text-primary hover:bg-secondary cursor-pointer rounded-full border px-[15px] py-[5px] text-[12px] text-nowrap shadow-[0px_0px_10px_0px_rgba(0,82,255,0.15)] transition-colors'
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                      onClick={handleOpen}
                    >
                      {hasNewReply ? '✅ Reply ready!' : '💡 Thinking...'}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* FAB Button */}
              <motion.button
                onClick={handleOpen}
                className='relative'
                aria-label='Open AI Assistant'
                style={{
                  filter: 'drop-shadow(0 0 30px rgba(0, 82, 255, 0.25))'
                }}
              >
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={
                    isDragging
                      ? { opacity: 1, scale: 1, rotate: 0 }
                      : isHovered
                        ? { opacity: 1, scale: 1, rotate: 0 }
                        : { opacity: 1, scale: 1, rotate: [0, 10, -10, 0] } // Default wiggle for logo
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
                  {/* Always show logo */}
                  <MimoLogo size={50} />
                </motion.div>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Draggable Chat Window */}
      <DraggableChatWindow
        ref={chatWindowRef}
        isOpen={isOpen}
        onClose={handleClose}
        initialPosition={calculateChatPosition()}
        suggestions={suggestions}
        onStatusChange={handleStatusChange}
      />
    </>
  );
}

export default React.memo(DraggableChatWithFAB);
