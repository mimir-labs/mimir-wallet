// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import React from 'react';
import { useToggle } from 'react-use';

import { useAddressMeta, useApi, useTxQueue } from '@mimir-wallet/hooks';

function DeleteAllProxy({ address }: { address: string }) {
  const { api } = useApi();
  const [isOpen, toggleOpen] = useToggle(false);
  const { addQueue } = useTxQueue();
  const { meta } = useAddressMeta(address);

  const handleDelete = () => {
    addQueue({
      accountId: address,
      call: api.tx.proxy.removeProxies(),
      website: 'mimir://internal/remove-proxies'
    });
    toggleOpen(false);
  };

  return (
    <>
      <Button variant='contained' fullWidth color='error' onClick={meta.isPure ? toggleOpen : handleDelete}>
        Delete All
      </Button>

      <Dialog maxWidth='sm' fullWidth open={isOpen} onClose={toggleOpen}>
        <DialogTitle>Attention</DialogTitle>

        <DialogContent>
          <Typography>
            If you delete the proxy relationship, <b style={{ fontWeight: 800 }}>NO ONE</b> will be able to control this
            account. Please make sure to carefully confirm the following:
          </Typography>

          <br />

          <Typography>1. The assets of this account have been successfully transferred.</Typography>
          <Typography>2. The account is not bound to any other application functions.</Typography>
          <br />

          <Typography>Please note that thisaction is irreversible.</Typography>
        </DialogContent>

        <DialogActions>
          <Button variant='contained' fullWidth color='error' onClick={handleDelete}>
            Continue
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default React.memo(DeleteAllProxy);
