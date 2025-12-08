// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type {
  SimpleChatRef,
  ToolData,
} from '@mimir-wallet/ai-assistant/SimpleChat';

import { addressToHex } from '@mimir-wallet/polkadot-core';
import { Skeleton } from '@mimir-wallet/ui';
import { motion, useDragControls } from 'framer-motion';
import React, {
  lazy,
  Suspense,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import { createPortal } from 'react-dom';

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

import { useAccount } from '@/accounts/useAccount';

// Lazy load SimpleChat to avoid loading react-syntax-highlighter (~640KB) on initial page load
const SimpleChat = lazy(() =>
  import('@mimir-wallet/ai-assistant/SimpleChat').then((mod) => ({
    default: mod.SimpleChat,
  })),
);

function ChatSkeleton() {
  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="space-y-3">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-10 w-1/2" />
      </div>
      <div className="mt-auto">
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </div>
  );
}

export interface DraggableChatProps {
  isOpen: boolean;
  onClose: () => void;
  initialPosition?: { x: number; y: number };
  className?: string;
  suggestions?: Array<[string, string]>; // Array of [label, value] pairs
  onStatusChange?: (
    status: 'submitted' | 'streaming' | 'ready' | 'error',
  ) => void;
  ref?: React.Ref<DraggableChatWindowRef>;
}

export interface DraggableChatWindowRef {
  sendMessage: (message: string) => void;
}

function DraggableChatWindow({
  isOpen,
  onClose,
  initialPosition,
  className = '',
  suggestions,
  onStatusChange,
  ref,
}: DraggableChatProps) {
  const { current } = useAccount();
  const currentHex = useMemo(
    () => (current ? addressToHex(current) : ''),
    [current],
  );
  const dragControls = useDragControls();
  const simpleChatRef = useRef<SimpleChatRef>(null);

  // Expose sendMessage through ref
  useImperativeHandle(
    ref,
    () => ({
      sendMessage: (message: string) => {
        simpleChatRef.current?.sendMessage(message);
      },
    }),
    [],
  );

  // Handle clear chat
  const handleClearChat = () => {
    simpleChatRef.current?.clearChat();
  };

  // RenderTool function for displaying tool results
  const renderTool = ({ tool }: { tool: ToolData }) => {
    const { type, toolCallId } = tool;

    // Handle unified showComponent tool
    if (type === 'tool-showComponent') {
      // Parse output from backend: { componentType: "...", props: { ... } }
      const output = tool.output as any;

      if (!output) return null;

      const { componentType, props = {} } = output;

      switch (componentType) {
        case 'matchDapps':
          return (
            <MatchedApps
              eventId={toolCallId}
              apps={props.dapps}
              network={props.network}
            />
          );
        case 'getFund':
          return <GetFund eventId={toolCallId} />;
        case 'walletConnect':
          return <WalletConnect eventId={toolCallId} />;
        case 'showQRCode':
          return props.address ? (
            <ShowQRCode eventId={toolCallId} address={props.address} />
          ) : null;
        case 'connectWallet':
          return <ConnectWallet eventId={toolCallId} />;
        case 'viewOnExplorer':
          return props.address ? (
            <ViewOnExplorer eventId={toolCallId} address={props.address} />
          ) : null;
        case 'addToWatchlist':
          return props.address ? (
            <AddToWatchlist eventId={toolCallId} address={props.address} />
          ) : null;
        case 'viewPendingTransaction':
          return props.address ? (
            <ViewPendingTransactions address={props.address} />
          ) : null;
        case 'setSs58Chain':
          return (
            <SetSs58Chain eventId={toolCallId} networkKey={props.networkKey} />
          );
        case 'switchNetworks':
          return (
            <SwitchNetworks eventId={toolCallId} networks={props.networks} />
          );
        default:
          return null;
      }
    } else if (type === 'tool-queryAccount') {
      const { accounts } = tool.input as { accounts?: string[] };

      return accounts?.length ? (
        <div className="flex w-full flex-col gap-2.5">
          {accounts.map((account: string, index: number) => (
            <QueryAccount key={`${account}-${index}`} account={account} />
          ))}
        </div>
      ) : null;
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

  const { position, dragConstraints, containerRef, handleDragEnd } =
    useDraggableChat({
      initialPosition,
      width: 395,
      height: dynamicHeight,
    });

  // Desktop draggable window - Keep component mounted to preserve chat state
  return createPortal(
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{
        opacity: isOpen ? 1 : 0,
        scale: isOpen ? 1 : 0.9,
        display: isOpen ? 'block' : 'none',
      }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className={`fixed top-0 z-50 ${className}`}
      style={{
        x: position.x,
        y: position.y,
        width: 395,
        height: dynamicHeight,
        pointerEvents: isOpen ? 'auto' : 'none',
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
      <div className="bg-background flex h-full flex-col overflow-hidden rounded-[20px] shadow-[0_0_30px_0_rgba(0,82,255,0.25)]">
        {/* Draggable account info bar - only this part can be dragged */}
        <div
          className="cursor-grab select-none active:cursor-grabbing"
          onPointerDown={(e) => dragControls.start(e)}
        >
          <AccountInfo />
        </div>

        {/* Non-draggable chat title with close button */}
        <div className="cursor-default">
          <ChatTitle onClose={onClose} onClearChat={handleClearChat} />
        </div>

        {/* Chat content area - SimpleChat */}
        <div className="flex flex-1 cursor-default flex-col overflow-hidden p-[15px]">
          <Suspense fallback={<ChatSkeleton />}>
            <SimpleChat
              ref={simpleChatRef}
              key={currentHex}
              renderTool={renderTool}
              suggestions={suggestions || []}
              onStatusChange={onStatusChange}
            />
          </Suspense>
        </div>

        {/* Disclaimer message */}
        <div className="text-foreground/50 cursor-default px-[15px] pb-3 text-center text-xs">
          Mimo can make mistakes. Check important info.
        </div>
      </div>
    </motion.div>,
    document.body,
  );
}

DraggableChatWindow.displayName = 'DraggableChatWindow';

export default React.memo(DraggableChatWindow);
