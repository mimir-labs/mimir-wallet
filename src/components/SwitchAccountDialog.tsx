// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SWITCH_ACCOUNT_REMIND_KEY } from '@mimir-wallet/constants';
import { useSelectedAccountCallback } from '@mimir-wallet/hooks';
import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Paper, Typography } from '@mui/material';
import React, { useState } from 'react';
import store from 'store';

import AddressCell from './AddressCell';

function Content({ address }: { address: string }) {
  return (
    <DialogContent>
      <Typography fontSize='1rem' marginBottom={1.5}>
        You are about to switch to this account
      </Typography>
      <Paper sx={{ padding: 1, bgcolor: 'secondary.main' }} variant='elevation'>
        <AddressCell shorten={false} value={address} withCopy />
      </Paper>
    </DialogContent>
  );
}

function Action({ checked, onClose, onConfirm, setChecked }: { checked: boolean; setChecked: (value: boolean) => void; onClose: () => void; onConfirm: () => void }) {
  return (
    <DialogActions sx={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <Box>
        <FormControlLabel control={<Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)} />} label='Don’t remind me next time' />
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

function SwitchAccountDialog({ address, onClose, onSelect, open }: { address: string; open: boolean; onClose: () => void; onSelect?: () => void }) {
  const selectAccount = useSelectedAccountCallback();
  const [checked, setChecked] = useState(false);

  const onConfirm = () => {
    selectAccount(address);
    onClose();
    onSelect?.();

    if (checked) {
      store.set(SWITCH_ACCOUNT_REMIND_KEY, true);
    }
  };

  return (
    <Dialog fullWidth maxWidth='sm' onClose={onClose} open={open}>
      <DialogTitle>Switch Account</DialogTitle>
      <Content address={address} />
      <Action checked={checked} onClose={onClose} onConfirm={onConfirm} setChecked={setChecked} />
    </Dialog>
  );
}

export default React.memo(SwitchAccountDialog);
