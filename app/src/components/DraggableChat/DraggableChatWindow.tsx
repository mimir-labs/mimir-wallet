// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ToolUIPart, UITools } from 'ai';

import { useAccount } from '@/accounts/useAccount';
import { motion, useDragControls } from 'framer-motion';
import React, { useMemo } from 'react';
import { createPortal } from 'react-dom';

import { SimpleChat } from '@mimir-wallet/ai-assistant';
import { addressToHex } from '@mimir-wallet/polkadot-core';

import { AccountInfo, ChatTitle } from './ChatHeader';
import MatchedApps from './MatchedApps';
import MatchOtherFeatures from './MatchOtherFeatures';
import SearchAddressBook from './SearchAddress';
import { useDraggableChat } from './useDraggableChat';
import ViewPendingTransactions from './ViewPendingTransactions';

export interface DraggableChatProps {
  isOpen: boolean;
  onClose: () => void;
  initialPosition?: { x: number; y: number };
  className?: string;
}

function DraggableChatWindow({ isOpen, onClose, initialPosition, className = '' }: DraggableChatProps) {
  const { current } = useAccount();
  const currentHex = useMemo(() => (current ? addressToHex(current) : ''), [current]);
  const dragControls = useDragControls();

  // RenderTool function for displaying tool results
  const renderTool = ({ tool }: { tool: ToolUIPart<UITools> }) => {
    if (tool.type === 'tool-matchDapps' && (tool.state === 'input-available' || tool.state === 'output-available')) {
      // Render the MatchedApps component
      return <MatchedApps eventId={tool.toolCallId} apps={(tool.input as any).dapps} />;
    }

    if (
      tool.type === 'tool-matchOtherFeatures' &&
      (tool.state === 'input-available' || tool.state === 'output-available')
    ) {
      // Render the MatchOtherFeatures component
      const input = tool.input as any;

      return <MatchOtherFeatures eventId={tool.toolCallId} type={input.type} address={input.address} />;
    }

    if (tool.type === 'tool-queryAccount' && tool.state === 'output-available') {
      try {
        const output = JSON.parse(tool.output as string);

        if (!output.accounts?.length) {
          return null;
        }

        return <SearchAddressBook eventId={tool.toolCallId} accounts={output.accounts} />;
      } catch {
        return null;
      }
    }

    if (tool.type === 'tool-viewPendingTransaction' && tool.state === 'output-available') {
      try {
        const output = JSON.parse(tool.output as string);

        if (!output.address) {
          return null;
        }

        return <ViewPendingTransactions address={output.address} />;
      } catch {
        return null;
      }
    }

    return null;
  };

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

  const dynamicHeight = calculateHeight();

  const { position, dragConstraints, containerRef, handleDragEnd } = useDraggableChat({
    initialPosition,
    width: 395,
    height: dynamicHeight
  });

  // Desktop draggable window - Keep component mounted to preserve chat state
  return createPortal(
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{
        opacity: isOpen ? 1 : 0,
        scale: isOpen ? 1 : 0.9,
        display: isOpen ? 'block' : 'none'
      }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className={`fixed top-0 z-50 ${className}`}
      style={{
        x: position.x,
        y: position.y,
        width: 395,
        height: dynamicHeight,
        pointerEvents: isOpen ? 'auto' : 'none'
      }}
      drag
      dragControls={dragControls}
      dragConstraints={dragConstraints}
      dragElastic={0}
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.02 }}
      dragListener={false}
    >
      <div className='bg-background shadow-medium flex h-full flex-col overflow-hidden rounded-[20px]'>
        {/* Draggable account info bar - only this part can be dragged */}
        <div className='cursor-grab select-none active:cursor-grabbing' onPointerDown={(e) => dragControls.start(e)}>
          <AccountInfo />
        </div>

        {/* Non-draggable chat title with close button */}
        <div className='cursor-default'>
          <ChatTitle onClose={onClose} />
        </div>

        {/* Chat content area - SimpleChat */}
        <div className='flex flex-1 cursor-default flex-col overflow-hidden p-[15px]'>
          <SimpleChat key={currentHex} renderTool={renderTool} />
        </div>
      </div>
    </motion.div>,
    document.body
  );
}

export default React.memo(DraggableChatWindow);
