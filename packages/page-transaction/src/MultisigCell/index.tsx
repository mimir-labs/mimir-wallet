// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { MultisigState } from '../types';

import { Paper } from '@mui/material';
import React, { useMemo } from 'react';

import { useApi } from '@mimirdev/react-hooks';

import Extrinsic from './Extrinsic';

function MultisigCell({ multisig }: { multisig: MultisigState }) {
  const { api } = useApi();

  const calldata = useMemo(() => {
    return api.registry.createType('Call', multisig.calldata);
  }, [api.registry, multisig.calldata]);

  return (
    <Paper sx={{ padding: 2.5 }}>
      <Extrinsic accountId={multisig.accountId} depositor={multisig.multisig.depositor} method={calldata} />
    </Paper>
  );
}

export default React.memo(MultisigCell);
