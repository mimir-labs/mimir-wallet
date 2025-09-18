// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ToolUIPart, UITools } from 'ai';

import { useAccount } from '@/accounts/useAccount';
import { motion, useDragControls } from 'framer-motion';
import React, { useMemo } from 'react';
import { createPortal } from 'react-dom';

import { SimpleChat } from '@mimir-wallet/ai-assistant';
import { addressToHex } from '@mimir-wallet/polkadot-core';

import AddToWatchlist from './AddToWatchlist';
import { AccountInfo, ChatTitle } from './ChatHeader';
import ConnectWallet from './ConnectWallet';
import GetFund from './GetFund';
import MatchedApps from './MatchedApps';
import SearchAddressBook from './SearchAddress';
import SetSs58Chain from './SetSs58Chain';
import ShowQRCode from './ShowQRCode';
import SwitchNetworks from './SwitchNetworks';
import { useDraggableChat } from './useDraggableChat';
import ViewOnExplorer from './ViewOnExplorer';
import ViewPendingTransactions from './ViewPendingTransactions';
import WalletConnect from './WalletConnect';

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

  // General function for parsing tool output
  const parseToolOutput = (tool: ToolUIPart<UITools>) => {
    if (tool.state !== 'output-available') return null;

    try {
      const output = JSON.parse(tool.output as string);

      // Check if operation has error
      if (output.error) {
        return null;
      }

      return output;
    } catch {
      return null;
    }
  };

  // RenderTool function for displaying tool results
  const renderTool = ({ tool }: { tool: ToolUIPart<UITools> }) => {
    const { type, state, toolCallId } = tool;

    // Simple tools that don't require output parsing
    if (state === 'input-available' || state === 'output-available') {
      switch (type) {
        case 'tool-getFund':
          return <GetFund eventId={toolCallId} />;
        case 'tool-walletConnect':
          return <WalletConnect eventId={toolCallId} />;
        case 'tool-connectWallet':
          return <ConnectWallet eventId={toolCallId} />;
        case 'tool-matchDapps':
          return <MatchedApps eventId={toolCallId} apps={(tool.input as any).dapps} />;
        case 'tool-switchNetworks':
          return <SwitchNetworks eventId={toolCallId} networks={(tool.input as any).networks} />;
        case 'tool-setSs58Chain':
          return <SetSs58Chain eventId={toolCallId} networkKey={(tool.input as any).networkKey} />;
      }
    }

    // Complex tools that require output parsing

    const output = parseToolOutput(tool);

    if (!output) return null;

    switch (type) {
      case 'tool-showQRCode':
        return <ShowQRCode eventId={toolCallId} address={output.address} />;
      case 'tool-viewOnExplorer':
        return output.address ? <ViewOnExplorer eventId={toolCallId} address={output.address} /> : null;
      case 'tool-addToWatchlist':
        return output.address ? <AddToWatchlist eventId={toolCallId} address={output.address} /> : null;
      case 'tool-queryAccount':
        return output.accounts?.length ? <SearchAddressBook eventId={toolCallId} accounts={output.accounts} /> : null;
      case 'tool-viewPendingTransaction':
        return output.address ? <ViewPendingTransactions address={output.address} /> : null;
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
