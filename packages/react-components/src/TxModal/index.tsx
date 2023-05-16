// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { DeriveBalancesAll } from '@polkadot/api-derive/types';

import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Paper, Stack, Typography } from '@mui/material';
import { useMemo, useState } from 'react';

import { useApi, useCall, useTx } from '@mimirdev/react-hooks';

import AddressRow from '../AddressRow';
import InputAddress from '../InputAddress';
import { getAddressMeta } from '../utils';
import Call from './Call';
import ConfirmButton from './ConfirmButton';

function extraAddressInfo(address: string): [isMultisig: boolean, who: string[]] {
  const meta = getAddressMeta(address);

  if (meta.isMultisig) {
    return [true, meta.who as string[]];
  } else {
    return [false, []];
  }
}

function Contents({ address, extrinsic, isMultisigCancel, onClose }: { isMultisigCancel: boolean; address: string; extrinsic: SubmittableExtrinsic<'promise'>; onClose: () => void }) {
  const { api } = useApi();
  const balances = useCall<DeriveBalancesAll>(api.derive.balances.all, [address]);
  const [signAddress, setSignAddress] = useState<string>();
  const [isMultisig, who] = useMemo(() => extraAddressInfo(address), [address]);

  return (
    <>
      <DialogContent>
        <Stack spacing={3}>
          <Box>
            <Typography fontWeight={700} mb={1}>
              Sending From
            </Typography>
            <Paper sx={{ bgcolor: 'secondary.main', padding: 1 }}>
              <AddressRow balance={balances?.freeBalance} size='small' value={address} withBalance />
            </Paper>
          </Box>
          <Divider />
          <Call extrinsic={extrinsic.method} />
          {isMultisig && (
            <>
              <Divider />
              <InputAddress filtered={who} isSign label='Initiator' onChange={setSignAddress} />
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <ConfirmButton address={address} extrinsic={extrinsic} isMultisig={isMultisig} isMultisigCancel={isMultisigCancel} onClick={onClose} signAddress={signAddress} />
        <Button onClick={onClose} variant='outlined'>
          Cancel
        </Button>
      </DialogActions>
    </>
  );
}

function TxModal() {
  const { isApiReady } = useApi();
  const { setTx, tx } = useTx();
  const open = !!tx;

  const onClose = () => {
    setTx(undefined);
  };

  return isApiReady ? (
    <Dialog maxWidth='sm' onClose={onClose} open={open}>
      <DialogTitle>Submit Transaction</DialogTitle>
      {isApiReady && tx && <Contents address={tx.accountId.toString()} extrinsic={tx.extrinsic} isMultisigCancel={tx.isMultisigCancel} onClose={onClose} />}
    </Dialog>
  ) : (
    <></>
  );
}

export default TxModal;
