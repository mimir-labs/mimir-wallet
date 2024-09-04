// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  SvgIcon,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { useMemo } from 'react';

import IconExternal from '@mimir-wallet/assets/svg/icon-external-app.svg?react';
import Logo from '@mimir-wallet/assets/svg/logo-circle.svg?react';
import { Address, AddressRow, BalanceFree } from '@mimir-wallet/components';
import { useUnConfirmMultisigs } from '@mimir-wallet/hooks';
import { getAddressMeta } from '@mimir-wallet/utils';

function Item({ address, withEdit }: { address: string; withEdit: boolean }) {
  const { breakpoints } = useTheme();
  const downSm = useMediaQuery(breakpoints.down('sm'));

  return (
    <Box
      sx={{
        padding: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        justifyContent: 'space-between',
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'grey.300'
      }}
    >
      <Box sx={{ flex: '1.3', display: 'flex', alignItems: 'center' }}>
        <AddressRow shorten size='small' value={address} withEdit={withEdit} withName />
      </Box>
      {!downSm && (
        <Typography sx={{ flex: '1.2' }}>
          <Address shorten value={address} />
        </Typography>
      )}
      <Box sx={{ flex: '1', textAlign: 'right' }}>
        <BalanceFree params={address} />
      </Box>
    </Box>
  );
}

function DetectedDialog({ multisigs, confirm }: { multisigs: string[]; confirm: (addresses: string[]) => void }) {
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
          {mimirs.length > 0 && (
            <Typography sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
              <Logo />
              Mimir
            </Typography>
          )}
          {mimirs.map((item) => (
            <Item address={item} key={item} withEdit={false} />
          ))}
          {externals.length > 0 && (
            <Typography sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
              <SvgIcon color='primary' component={IconExternal} inheritViewBox />
              External
            </Typography>
          )}
          {externals.map((item) => (
            <Item address={item} key={item} withEdit />
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          fullWidth
          onClick={() => {
            confirm(multisigs);
          }}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function DetectedMultisig() {
  const [multisigs, confirm] = useUnConfirmMultisigs();

  if (multisigs.length === 0) {
    return null;
  }

  return <DetectedDialog multisigs={multisigs} confirm={confirm} />;
}

export default DetectedMultisig;
