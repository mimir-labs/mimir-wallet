// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Call } from '@polkadot/types/interfaces';

import IconClose from '@/assets/svg/icon-close.svg?react';
import { Input } from '@/components';
import JsonView from '@/components/JsonView';
import { Box, IconButton, Stack, SvgIcon, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';

import { useApi } from '@mimir-wallet/polkadot-core';

import { decodeCallData } from './utils';

function CallDataViewer({ calldata, onClose }: { calldata: string; onClose: () => void }) {
  const { api } = useApi();
  const [parsedCallData, setParsedCallData] = useState<Call | null>(null);
  const [callDataError, setCallDataError] = useState<Error | null>(null);

  useEffect(() => {
    const [call, error] = decodeCallData(api.registry, calldata);

    setParsedCallData(call);
    setCallDataError(error);
  }, [api.registry, calldata]);

  return (
    <Stack spacing={2}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant='h4'>Call Data Details</Typography>
        <IconButton
          sx={{ border: '1px solid', bordercolor: 'primary.main' }}
          size='small'
          color='primary'
          onClick={onClose}
        >
          <SvgIcon component={IconClose} inheritViewBox />
        </IconButton>
      </Box>

      <Input label='Call Data' placeholder='0x...' disabled value={calldata} />

      {callDataError && (
        <Box
          sx={{
            bgcolor: 'secondary.main',
            padding: 1,
            borderRadius: 1,
            wordBreak: 'break-all'
          }}
        >
          <Typography fontFamily='Geist Mono' color='error' fontSize='0.75rem'>
            {callDataError.message}
          </Typography>
        </Box>
      )}

      {parsedCallData && (
        <Box sx={{ borderRadius: 1, bgcolor: 'secondary.main', padding: 1 }}>
          <JsonView data={parsedCallData.toHuman()} collapseStringsAfterLength={20} />
        </Box>
      )}
    </Stack>
  );
}

export default React.memo(CallDataViewer);
