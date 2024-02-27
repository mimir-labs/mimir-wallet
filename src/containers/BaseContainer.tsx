// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { DetectedMultisig, GlobalStyle, MimirLoading, TxModal } from '@mimir-wallet/components';
import { useApi } from '@mimir-wallet/hooks';
import { useWallet } from '@mimir-wallet/hooks/useWallet';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';

import TopBar from './TopBar';

function BaseContainer() {
  const { isApiConnected, isApiReady } = useApi();
  const { isMultisigSyned, isWalletReady } = useWallet();

  return (
    <>
      <TxModal />
      <GlobalStyle />
      <TopBar />
      {isApiReady && isApiConnected && isWalletReady && isMultisigSyned ? (
        <Box sx={{ height: '100%' }}>
          <Outlet />
          <DetectedMultisig />
        </Box>
      ) : (
        <Box
          sx={{
            background: 'linear-gradient(245deg, #F4F2FF 0%, #FBFDFF 100%)',
            position: 'absolute',
            left: 0,
            right: 0,
            top: 56,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <MimirLoading />
        </Box>
      )}
    </>
  );
}

export default BaseContainer;
