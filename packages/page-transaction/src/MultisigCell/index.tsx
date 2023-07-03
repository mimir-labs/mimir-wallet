// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { MultisigState } from '../types';

import { Paper } from '@mui/material';
import React, { useMemo } from 'react';

import { useApi } from '@mimirdev/react-hooks';

import Extrinsic from './Extrinsic';
import Process from './Process';

function MultisigCell({ multisig }: { multisig: MultisigState }) {
  const { api } = useApi();

  const calldata = useMemo(() => {
    return api.registry.createType('Call', multisig.calldata);
  }, [api.registry, multisig.calldata]);

  return (
    <Paper sx={{ display: 'flex', padding: 2, gap: 2 }}>
      <Extrinsic accountId={multisig.accountId} depositor={multisig.multisig.depositor} method={calldata} />
      <Process accountId={multisig.accountId} approvals={multisig.multisig.approvals.toArray()} />
    </Paper>
  );
}

export default React.memo(MultisigCell);
