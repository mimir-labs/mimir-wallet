// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { walletConfig } from '@mimir-wallet/config';
import { WalletCtx } from '@mimir-wallet/hooks';
import { Box, Button, Dialog, DialogContent, DialogTitle, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import React, { useContext } from 'react';

import { toastError } from './ToastRoot';
import WalletIcon from './WalletIcon';

function WalletCell({ downloadUrl, id, name: propsName }: { name: string; id: string; icon: string; disabledIcon: string; downloadUrl: string }) {
  const { connect, connectedWallets, disconnect, wallets } = useContext(WalletCtx);
  const { breakpoints } = useTheme();
  const downSm = useMediaQuery(breakpoints.down('sm'));

  const name = id === 'polkadot-js' && window?.walletExtension?.isNovaWallet ? 'Nova' : propsName;

  return (
    <Stack alignItems='center' justifyContent='center' spacing={1}>
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
    <Dialog maxWidth='sm' onClose={onClose} open={open}>
      <DialogTitle textAlign='center'>Connect Wallet</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { sm: 4, xs: 2 } }}>
          {Object.entries(walletConfig).map(([id, config]) => (
            <WalletCell disabledIcon={config.disabledIcon} downloadUrl={config.downloadUrl} icon={config.icon} id={id} key={id} name={config.name} />
          ))}
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default React.memo(ConnectWalletModal);
