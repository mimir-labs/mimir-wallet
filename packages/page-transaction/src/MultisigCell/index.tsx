// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Paper } from '@mui/material';
import React, { useMemo } from 'react';

import { useApi, useCalldata } from '@mimirdev/react-hooks';
import { MultisigTransaction } from '@mimirdev/react-hooks/types';

import Extrinsic from './Extrinsic';
import Process from './Process';

function MultisigCell({ transaction }: { transaction: MultisigTransaction }) {
  const { api } = useApi();
  const data = useCalldata(transaction.callhash);

  const calldata = useMemo(() => {
    return api.registry.createType('Call', data?.data || '0x');
  }, [api.registry, data?.data]);

  return (
    <Paper sx={{ display: 'flex', padding: 2, gap: 2 }}>
      <Extrinsic accountId={transaction.multisigAccount} depositor={transaction.depositor} id={transaction.id} method={calldata} status={transaction.status} />
      <Process accountId={transaction.multisigAccount} approvals={transaction.approvedAccounts} status={transaction.status} />
    </Paper>
  );
}

export default React.memo(MultisigCell);
