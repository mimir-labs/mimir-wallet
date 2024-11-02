// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid2 as Grid,
  Stack,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { AccessCredentials, initializePlutonicationDAppClientWithModal } from '@plutonication/plutonication';
import React from 'react';

import { walletConfig } from '@mimir-wallet/config';
import { useWallet } from '@mimir-wallet/hooks';

import { toastError } from './ToastRoot';
import WalletIcon from './WalletIcon';

function WalletCell({ downloadUrl, id, name: propsName }: { name: string; id: string; downloadUrl: string }) {
  const { connect, connectedWallets, disconnect, wallets } = useWallet();
  const { breakpoints } = useTheme();
  const downSm = useMediaQuery(breakpoints.down('sm'));

  const name = id === 'polkadot-js' && window?.walletExtension?.isNovaWallet ? 'Nova' : propsName;

  return (
    <Stack
      alignItems='center'
      justifyContent='center'
      spacing={1}
      sx={{ '>.MuiButton-root': { width: '100%' }, width: '100%' }}
    >
      <WalletIcon disabled={!wallets[id]} id={id} sx={{ width: { sm: 64, xs: 40 }, height: { sm: 64, xs: 40 } }} />
      <Typography>{name}</Typography>
      {wallets[id] ? (
        connectedWallets.includes(id) ? (
          <Button color='error' onClick={() => disconnect(id)} size={downSm ? 'small' : 'medium'} variant='outlined'>
            Disconnect
          </Button>
        ) : (
          <Button onClick={() => connect(id).catch(toastError)} size={downSm ? 'small' : 'medium'} variant='outlined'>
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

            await initializePlutonicationDAppClientWithModal(accessCredentials, (receivedPubkey: string) => {
              /* */
              console.log(receivedPubkey);
            });

            connect('plutonication').catch(toastError);
          }}
          size={downSm ? 'small' : 'medium'}
          variant='outlined'
        >
          Connect
        </Button>
      ) : (
        <Button component='a' href={downloadUrl} size={downSm ? 'small' : 'medium'} target='_blank' variant='outlined'>
          Download
        </Button>
      )}
    </Stack>
  );
}

function ConnectWalletModal({ onClose, open }: { open: boolean; onClose: () => void }) {
  return (
    <>
      <Dialog maxWidth='md' onClose={onClose} open={open}>
        <DialogTitle textAlign='center'>Connect Wallet</DialogTitle>
        <DialogContent sx={{ overflow: 'hidden' }}>
          <Grid columns={{ xs: 12 }} container spacing={{ sm: 4, xs: 2 }}>
            {Object.entries(walletConfig).map(([id, config]) => (
              <Grid key={id} size={{ sm: 3, xs: 4 }}>
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
