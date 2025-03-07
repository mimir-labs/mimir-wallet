// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { walletConfig } from '@/config';
import { connectWallet, disconnectWallet } from '@/wallet/connect';
import { useWallet } from '@/wallet/useWallet';
import { alpha, Box, Button, Dialog, DialogContent, DialogTitle, Grid2 as Grid } from '@mui/material';
import { AccessCredentials, initializePlutonicationDAppClientWithModal } from '@plutonication/plutonication';
import React, { useMemo } from 'react';

import { toastError } from './utils';
import WalletIcon from './WalletIcon';

function WalletCell({ downloadUrl, id, name }: { name: string; id: string; downloadUrl: string }) {
  const { connectedWallets, wallets } = useWallet();

  const isInstalled =
    id === 'nova' ? wallets[walletConfig[id].key] && window?.walletExtension?.isNovaWallet : wallets[id];

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 0.5,
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'secondary.main',
        padding: 1,
        bgcolor: connectedWallets.includes(id) ? 'secondary.main' : 'transparent'
      }}
    >
      <WalletIcon disabled={!isInstalled} id={id} sx={{ width: 20, height: 20 }} />
      <Box sx={{ flex: 1, fontSize: '1rem' }}>{name}</Box>
      {isInstalled ? (
        connectedWallets.includes(id) ? (
          <Button
            color='error'
            onClick={() => disconnectWallet(id)}
            size='small'
            variant='text'
            sx={({ palette }) => ({ bgcolor: alpha(palette.error.main, 0.1) })}
          >
            Disconnect
          </Button>
        ) : (
          <Button onClick={() => connectWallet(id).catch(toastError)} size='small' variant='outlined'>
            Connect
          </Button>
        )
      ) : id === 'plutonication' ? (
        <Button
          onClick={async () => {
            const accessCredentials = new AccessCredentials(
              'wss://plutonication.com/',
              'Mimir',
              'https://plutonication.com/dapp/mimir-icon',
              'Mimir'
            );

            await initializePlutonicationDAppClientWithModal(accessCredentials, (_receivedPubkey: string) => {});

            connectWallet('plutonication').catch(toastError);
          }}
          size='small'
          variant='outlined'
        >
          Connect
        </Button>
      ) : (
        <Button component='a' href={downloadUrl} size='small' target='_blank' variant='text'>
          Download
        </Button>
      )}
    </Box>
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
      <Dialog maxWidth='sm' onClose={onClose} open={open}>
        <DialogTitle textAlign='center'>Connect Wallet</DialogTitle>
        <DialogContent sx={{ overflow: 'hidden', maxWidth: '474px' }}>
          <Grid columns={{ sm: 4, xs: 2 }} container rowSpacing={2} columnSpacing={1}>
            {sortedWalletConfig.map(([id, config]) => (
              <Grid key={id} size={2}>
                <WalletCell downloadUrl={config.downloadUrl} id={id} name={config.name} />
              </Grid>
            ))}
          </Grid>
        </DialogContent>
      </Dialog>
      <plutonication-modal />
    </>
  );
}

export default React.memo(ConnectWalletModal);
