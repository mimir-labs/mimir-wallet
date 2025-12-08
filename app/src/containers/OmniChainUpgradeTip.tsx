// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useLocalStore } from '@mimir-wallet/service';
import {
  cn,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from '@mimir-wallet/ui';
import { useState } from 'react';

import { analyticsActions } from '@/analytics';
import { NEW_FEATURE_TIP_KEY } from '@/constants';
import { useMediaQuery } from '@/hooks/useMediaQuery';

const tabs = [
  { key: 'ai-assistant', title: 'AI' },
  { key: 'remoteProxy', title: 'Remote Proxy' },
  { key: 'omniUX', title: 'OmniUX' },
  { key: 'callTemplate', title: 'Call Template' },
  { key: 'walletConnect', title: 'WalletConnect' },
  { key: 'quickSimulation', title: 'Quick Simulation' },
];

const tabContent: Record<string, { video: string; description: string }> = {
  'ai-assistant': {
    video: 'https://mimir-labs.github.io/mimir-assets/videos/ai.mp4',
    description:
      'Mimir AI: Use the AI assistant to help with daily interactions, quickly understand multisig, and find applications that match your intentions.',
  },
  remoteProxy: {
    video: 'https://mimir-labs.github.io/mimir-assets/videos/Remoteproxy2.mp4',
    description:
      'Instead of setting up proxy accounts on each parachain, remote-proxy module allows you to create it once on the Relay Chain — then compatible parachains can automatically inherit that proxy. Now it supports Kusama<>Kusama Assethub.',
  },
  omniUX: {
    video: 'https://mimir-labs.github.io/mimir-assets/videos/OmniUX.mp4',
    description:
      'Seamless management of multi-sig accounts across multiple parachains, enabling a unified cross-chain experience.',
  },
  callTemplate: {
    video: 'https://mimir-labs.github.io/mimir-assets/videos/CallTemplate.mp4',
    description:
      'Predefined transaction templates simplify common DAO & team operations, eliminating the need for manual data input each time.',
  },
  walletConnect: {
    video: 'https://mimir-labs.github.io/mimir-assets/videos/WalletConnect.mp4',
    description:
      'Mimir integrates Wallet Connect, enabling direct multisig interaction with Dapps, allowing users to sign and approve transactions seamlessly.',
  },
  quickSimulation: {
    video:
      'https://mimir-labs.github.io/mimir-assets/videos/QuickSimulation.mp4',
    description:
      'Run a transaction simulation in 1–2 seconds and instantly display changes in account balances.',
  },
};

function OmniChainUpgradeTip() {
  const [isRead, setIsRead] = useLocalStore<boolean>(
    NEW_FEATURE_TIP_KEY,
    false,
  );
  const upSm = useMediaQuery('sm');
  const [activeTab, setActiveTab] = useState('ai-assistant');

  if (isRead) return null;

  const content = tabContent[activeTab];

  return (
    <Modal
      isOpen
      size="3xl"
      onClose={() => {
        analyticsActions.onboardingFeaturesClose();
        setIsRead(true);
      }}
    >
      <ModalContent>
        <ModalHeader className="text-xl font-bold">✨New Features</ModalHeader>
        <ModalBody>
          <div className={cn('flex', upSm ? 'flex-row' : 'flex-col-reverse')}>
            {/* Tab List */}
            <div
              className={cn(
                'flex gap-1',
                upSm
                  ? 'flex-col pr-2'
                  : 'flex-row flex-wrap justify-center pt-3',
              )}
            >
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key);
                    analyticsActions.onboardingFeature(tab.key);
                  }}
                  className={cn(
                    'text-foreground/50 cursor-pointer rounded-md px-3 py-2 text-left text-sm font-medium transition-colors',
                    activeTab === tab.key
                      ? 'bg-secondary text-foreground'
                      : 'hover:text-foreground/70',
                  )}
                >
                  {tab.title}
                </button>
              ))}
            </div>

            {/* Tab Panel */}
            <div
              className={cn(
                'flex-1 space-y-5',
                upSm ? 'border-l-secondary border-l pl-3' : '',
              )}
            >
              <div className="bg-secondary flex items-center justify-center rounded-[10px] p-5">
                <video
                  key={content.video}
                  src={content.video}
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls={false}
                  className="pointer-events-none h-auto max-w-full"
                />
              </div>
              <p className="text-foreground font-bold">{content.description}</p>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default OmniChainUpgradeTip;
