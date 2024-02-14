// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ReactComponent as Logo } from '@mimir-wallet/assets/svg/logo-circle.svg';
import { useUnConfirmMultisigs } from '@mimir-wallet/hooks';
import { getAddressMeta } from '@mimir-wallet/utils';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import keyring from '@polkadot/ui-keyring';
import { useMemo } from 'react';

import Address from './Address';
import AddressRow from './AddressRow';
import BalanceFree from './BalanceFree';

function Item({ address, withEdit }: { address: string; withEdit: boolean }) {
  return (
    <Box sx={{ padding: 1, display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'space-between', borderRadius: 1, border: '1px solid', borderColor: 'grey.300' }}>
      <Box sx={{ flex: '1.3', display: 'flex', alignItems: 'center' }}>
        <AddressRow size='small' value={address} withEdit={withEdit} withName />
      </Box>
      <Typography sx={{ flex: '1.2' }}>
        <Address shorten value={address} />
      </Typography>
      <Box sx={{ flex: '1', textAlign: 'right' }}>
        <BalanceFree params={address} />
      </Box>
    </Box>
  );
}

function DetectedDialog({ multisigs }: { multisigs: string[] }) {
  const [mimirs, externals] = useMemo((): [string[], string[]] => {
    const mimirs: string[] = [];
    const externals: string[] = [];

    multisigs.forEach((address) => {
      const meta = getAddressMeta(address);

      if (meta.isMimir) {
        mimirs.push(address);
      } else {
        externals.push(address);
      }
    });

    return [mimirs, externals];
  }, [multisigs]);

  return (
    <Dialog fullWidth maxWidth='sm' open>
      <DialogTitle>New Multisig Account Detected</DialogTitle>
      <DialogContent>
        <Stack spacing={1.5}>
          <Typography sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
            <Logo />
            Mimir
          </Typography>
          {mimirs.map((item) => (
            <Item address={item} key={item} withEdit={false} />
          ))}
          <Typography>External</Typography>
          {externals.map((item) => (
            <Item address={item} key={item} withEdit />
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          fullWidth
          onClick={() => {
            try {
              for (const address of mimirs.concat(externals)) {
                const pair = keyring.getPair(address);

                keyring.saveAccountMeta(pair, { isConfirm: true });
              }
            } catch {}
          }}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function DetectedMultisig() {
  const multisigs = useUnConfirmMultisigs();

  if (multisigs.length === 0) {
    return null;
  }

  return <DetectedDialog multisigs={multisigs} />;
}

export default DetectedMultisig;
