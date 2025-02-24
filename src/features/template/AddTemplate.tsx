// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Call } from '@polkadot/types/interfaces';
import type { Registry } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';

import { Box, Button, Divider, IconButton, Link, Stack, SvgIcon, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

import IconArrowLeft from '@mimir-wallet/assets/svg/icon-arrow-left.svg?react';
import { Input } from '@mimir-wallet/components';
import JsonView from '@mimir-wallet/components/JsonView';
import { useApi } from '@mimir-wallet/hooks/useApi';
import { useInput } from '@mimir-wallet/hooks/useInput';

import { useSavedTemplate } from './useSavedTemplate';

function decodeCallData(registry: Registry, callData: string): [Call | null, Error | null] {
  if (!callData) return [null, null];

  try {
    const call = registry.createType('Call', callData);

    return [call, null];
  } catch (error) {
    return [null, error as Error];
  }
}

function AddTemplate({ onBack, defaultCallData }: { defaultCallData?: HexString; onBack: () => void }) {
  const { network, api } = useApi();
  const { addTemplate } = useSavedTemplate(network);
  const [name, setName] = useInput('');
  const [callData, setCallData] = useInput(defaultCallData || '');
  const [parsedCallData, setParsedCallData] = useState<Call | null>(null);
  const [callDataError, setCallDataError] = useState<Error | null>(null);

  useEffect(() => {
    const [call, error] = decodeCallData(api.registry, callData);

    setParsedCallData(call);
    setCallDataError(error);
  }, [api.registry, callData]);

  const onAdd = () => {
    if (!name || !callData || !!callDataError || !parsedCallData) return;
    parsedCallData.data;

    addTemplate({ name, call: parsedCallData.toHex() });

    onBack();
  };

  return (
    <Stack spacing={2}>
      <Box display='flex' gap={0.5} alignItems='center'>
        <IconButton color='inherit' onClick={onBack}>
          <SvgIcon inheritViewBox component={IconArrowLeft} />
        </IconButton>
        <Typography variant='h4'>Add New Template</Typography>
      </Box>

      <Divider />

      <Input label='Name' value={name} onChange={setName} />

      <Input
        label='Call Data'
        placeholder='0x...'
        helper={
          <Box color='text.primary'>
            You can edit it in the{' '}
            <Link underline='hover' target='_blank'>
              DOT Console
            </Link>{' '}
            and then click Import or directly paste the Encoded Call Data.
          </Box>
        }
        value={callData}
        onChange={setCallData}
      />

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

      <Button variant='contained' color='primary' disabled={!name || !callData || !!callDataError} onClick={onAdd}>
        Add
      </Button>
    </Stack>
  );
}

export default AddTemplate;
