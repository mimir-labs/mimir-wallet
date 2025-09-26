// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountData } from '@/hooks/types';
import type { ToolUIPart, UITools } from 'ai';

import { useAccount } from '@/accounts/useAccount';
import { motion, useDragControls } from 'framer-motion';
import React, { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';

import { SimpleChat, type SimpleChatRef } from '@mimir-wallet/ai-assistant';
import { addressToHex } from '@mimir-wallet/polkadot-core';

import AddToWatchlist from './AddToWatchlist';
import { AccountInfo, ChatTitle } from './ChatHeader';
import ConnectWallet from './ConnectWallet';
import GetFund from './GetFund';
import MatchedApps from './MatchedApps';
import QueryAccount from './QueryAccount';
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
  suggestions?: Array<[string, string]>; // Array of [label, value] pairs
  onStatusChange?: (status: 'submitted' | 'streaming' | 'ready' | 'error') => void;
}

export interface DraggableChatWindowRef {
  sendMessage: (message: string) => void;
}

const DraggableChatWindow = forwardRef<DraggableChatWindowRef, DraggableChatProps>(
  ({ isOpen, onClose, initialPosition, className = '', suggestions, onStatusChange }, ref) => {
    const { current } = useAccount();
    const currentHex = useMemo(() => (current ? addressToHex(current) : ''), [current]);
    const dragControls = useDragControls();
    const simpleChatRef = useRef<SimpleChatRef>(null);

    // Expose sendMessage through ref
    useImperativeHandle(
      ref,
      () => ({
        sendMessage: (message: string) => {
          simpleChatRef.current?.sendMessage(message);
        }
      }),
      []
    );

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
          return output.accounts?.length ? (
            <div className='flex w-full flex-col gap-[10px]'>
              {output.accounts.map((account: AccountData, index: number) => (
                <QueryAccount key={`${account.address}-${index}`} account={account} />
              ))}
            </div>
          ) : null;
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
        <div className='bg-background flex h-full flex-col overflow-hidden rounded-[20px] shadow-[0_0_30px_0_rgba(0,82,255,0.25)]'>
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
            <SimpleChat
              ref={simpleChatRef}
              key={currentHex}
              renderTool={renderTool}
              suggestions={suggestions || []}
              onStatusChange={onStatusChange}
            />
          </div>
        </div>
      </motion.div>,
      document.body
    );
  }
);

DraggableChatWindow.displayName = 'DraggableChatWindow';

export default React.memo(DraggableChatWindow);
