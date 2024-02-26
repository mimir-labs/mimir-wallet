// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { walletConfig } from '@mimir-wallet/config';
import { WalletCtx } from '@mimir-wallet/hooks';
import { Box, Button, Dialog, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import React, { useContext } from 'react';

function WalletCell({ disabledIcon, downloadUrl, icon, name, wallet }: { name: string; wallet: string; icon: string; disabledIcon: string; downloadUrl: string }) {
  const { connect, connectedWallets, disconnect, wallets } = useContext(WalletCtx);

  return (
    <Stack alignItems='center' justifyContent='center' spacing={1}>
      <Box component='img' src={wallets[wallet] ? icon : disabledIcon} sx={{ width: 64, height: 64 }} />
      <Typography>{name}</Typography>
      {wallets[wallet] ? (
        connectedWallets.includes(wallet) ? (
          <Button color='error' onClick={() => disconnect(wallet)} variant='outlined'>
            Disconnect
          </Button>
        ) : (
          <Button onClick={() => connect(wallet)} variant='outlined'>
            Connect
          </Button>
        )
      ) : (
        <Button component='a' href={downloadUrl} target='_blank' variant='outlined'>
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
        <Box sx={{ display: 'flex', gap: 4 }}>
          {Object.entries(walletConfig).map(([wallet, config]) => (
            <WalletCell disabledIcon={config.disabledIcon} downloadUrl={config.downloadUrl} icon={config.icon} key={wallet} name={config.name} wallet={wallet} />
          ))}
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default React.memo(ConnectWalletModal);
