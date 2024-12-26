// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Paper,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import React, { useState } from 'react';

import { useAccount } from '@mimir-wallet/accounts/useAccount';
import { SWITCH_ACCOUNT_REMIND_KEY } from '@mimir-wallet/constants';
import { store } from '@mimir-wallet/utils';

import AddressCell from './AddressCell';

function Content({ address }: { address: string }) {
  const { breakpoints } = useTheme();
  const downSm = useMediaQuery(breakpoints.down('sm'));

  return (
    <DialogContent>
      <Typography fontSize='1rem' marginBottom={1.5}>
        You are about to switch to this account
      </Typography>
      <Paper sx={{ padding: 1, bgcolor: 'secondary.main' }} variant='elevation'>
        <AddressCell shorten={downSm} value={address} withCopy withAddressBook />
      </Paper>
    </DialogContent>
  );
}

function Action({
  checked,
  onClose,
  onConfirm,
  setChecked
}: {
  checked: boolean;
  setChecked: (value: boolean) => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <DialogActions sx={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <Box>
        <FormControlLabel
          control={<Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)} />}
          label='Don’t remind me next time'
        />
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Button fullWidth onClick={onClose} variant='outlined'>
            Cancel
          </Button>
          <Button fullWidth onClick={onConfirm}>
            Confirm
          </Button>
        </Box>
      </Box>
    </DialogActions>
  );
}

function SwitchAccountDialog() {
  const { switchAddress, current, setCurrent } = useAccount();
  const [checked, setChecked] = useState(false);

  if (!switchAddress || !current) {
    return null;
  }

  const onConfirm = () => {
    setCurrent(switchAddress);

    if (checked) {
      store.set(SWITCH_ACCOUNT_REMIND_KEY, true);
    }
  };

  const onClose = () => {
    setCurrent(current);
  };

  return (
    <Dialog fullWidth maxWidth='sm' open>
      <DialogTitle>Switch Account</DialogTitle>
      <Content address={switchAddress} />
      <Action checked={checked} onClose={onClose} onConfirm={onConfirm} setChecked={setChecked} />
    </Dialog>
  );
}

export default React.memo(SwitchAccountDialog);
