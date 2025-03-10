// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { walletConfig } from '@/config';
import { connectWallet, disconnectWallet } from '@/wallet/connect';
import { useWallet } from '@/wallet/useWallet';
import { AccessCredentials, initializePlutonicationDAppClientWithModal } from '@plutonication/plutonication';
import React, { useMemo } from 'react';

import { Button, Modal, ModalBody, ModalContent, ModalHeader } from '@mimir-wallet/ui';

import { toastError } from './utils';
import WalletIcon from './WalletIcon';

function WalletCell({ downloadUrl, id, name }: { name: string; id: string; downloadUrl: string }) {
  const { connectedWallets, wallets } = useWallet();

  const isInstalled =
    id === 'nova' ? wallets[walletConfig[id].key] && window?.walletExtension?.isNovaWallet : wallets[id];

  return (
    <div
      data-connected={connectedWallets.includes(id)}
      className='flex items-center justify-start gap-1 rounded-medium border-1 border-secondary p-2.5 bg-transparent data-[connected=true]:bg-secondary'
    >
      <WalletIcon disabled={!isInstalled} id={id} style={{ width: 20, height: 20 }} />
      <div className='flex-1 text-medium'>{name}</div>
      {isInstalled ? (
        connectedWallets.includes(id) ? (
          <Button className='h-7' color='danger' onPress={() => disconnectWallet(id)} variant='flat'>
            Disconnect
          </Button>
        ) : (
          <Button className='h-7' onPress={() => connectWallet(id).catch(toastError)} variant='ghost'>
            Connect
          </Button>
        )
      ) : id === 'plutonication' ? (
        <Button
          className='h-7'
          onPress={async () => {
            const accessCredentials = new AccessCredentials(
              'wss://plutonication.com/',
              'Mimir',
              'https://plutonication.com/dapp/mimir-icon',
              'Mimir'
            );

            await initializePlutonicationDAppClientWithModal(accessCredentials, (_receivedPubkey: string) => {});

            connectWallet('plutonication').catch(toastError);
          }}
          variant='ghost'
        >
          Connect
        </Button>
      ) : (
        <Button as='a' href={downloadUrl} target='_blank' variant='light'>
          Download
        </Button>
      )}
    </div>
  );
}

function ConnectWalletModal({ onClose, open }: { open: boolean; onClose: () => void }) {
  const { connectedWallets, wallets } = useWallet();

  // Sort walletConfig: connected first, unconnected second, not installed last
  const sortedWalletConfig = useMemo(() => {
    return Object.entries(walletConfig).sort(([id], [id2]) => {
      const isInstalled =
        id === 'nova' ? wallets[walletConfig[id].key] && window?.walletExtension?.isNovaWallet : wallets[id];
      const isInstalled2 =
        id2 === 'nova' ? wallets[walletConfig[id2].key] && window?.walletExtension?.isNovaWallet : wallets[id2];

      const left = connectedWallets.includes(id) ? 2 : isInstalled ? 1 : isInstalled2 ? 0 : -1;
      const right = connectedWallets.includes(id2) ? 2 : isInstalled2 ? 1 : isInstalled ? 0 : -1;

      return right - left;
    });
  }, [wallets, connectedWallets]);

  return (
    <>
      <Modal onClose={onClose} isOpen={open} size='xl'>
        <ModalContent>
          <ModalHeader className='justify-center'>Connect Wallet</ModalHeader>
          <ModalBody>
            <div className='grid grid-cols-2 sm:grid-cols-2 gap-x-5 gap-y-2.5'>
              {sortedWalletConfig.map(([id, config]) => (
                <WalletCell key={id} downloadUrl={config.downloadUrl} id={id} name={config.name} />
              ))}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
      <plutonication-modal />
    </>
  );
}

export default React.memo(ConnectWalletModal);
