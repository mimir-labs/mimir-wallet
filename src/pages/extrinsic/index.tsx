// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Call } from '@polkadot/types/interfaces';
import type { Registry } from '@polkadot/types/types';

import { Box, Button, Divider, Link, Paper, Stack, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';

import { useSelectedAccount } from '@mimir-wallet/accounts/useSelectedAccount';
import { Input, InputAddress } from '@mimir-wallet/components';
import JsonView from '@mimir-wallet/components/JsonView';
import { events } from '@mimir-wallet/events';
import { useApi } from '@mimir-wallet/hooks/useApi';
import { useInput } from '@mimir-wallet/hooks/useInput';
import { useTxQueue } from '@mimir-wallet/hooks/useTxQueue';
import { Call as CallComp } from '@mimir-wallet/params';

function decodeCallData(registry: Registry, callData: string): [Call | null, Error | null] {
  if (!callData) return [null, null];

  try {
    const call = registry.createType('Call', callData);

    return [call, null];
  } catch (error) {
    return [null, error as Error];
  }
}

function PageExtrinsic() {
  const { api } = useApi();
  const selected = useSelectedAccount();
  const [sending, setSending] = useState<string | undefined>(selected || '');
  const [callData, setCallData] = useInput('');
  const { addQueue } = useTxQueue();
  const [parsedCallData, setParsedCallData] = useState<Call | null>(null);
  const [callDataError, setCallDataError] = useState<Error | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    const [call, error] = decodeCallData(api.registry, callData);

    setParsedCallData(call);
    setCallDataError(error);
  }, [api.registry, callData]);

  const handleClick = useCallback(() => {
    if (parsedCallData) {
      addQueue({
        call: parsedCallData,
        accountId: sending,
        website: 'mimir://internal/template'
      });
    }
  }, [addQueue, parsedCallData, sending]);

  return (
    <Paper sx={{ width: '100%', maxWidth: 500, margin: '0 auto', padding: 2.5, borderRadius: '20px', marginTop: 1.25 }}>
      <Stack spacing={2}>
        <Typography variant='h3'>Submit Extrinsic</Typography>

        <InputAddress isSign label='Sending From' onChange={setSending} placeholder='Sender' value={sending} />

        <Input
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.5 }}>
              Call Data
              <Link component='button' underline='none' color='primary' onClick={() => events.emit('template_open')}>
                View Template
              </Link>
            </Box>
          }
          placeholder='0x...'
          color={callDataError ? 'error' : 'primary'}
          helper={
            <Box color='text.primary'>
              You can paste the Encoded Call Data in{' '}
              <Link underline='hover' target='_blank'>
                DOT Console
              </Link>
              /
              <Link underline='hover' target='_blank'>
                Polkadot.JS
              </Link>
              .
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
          <Stack spacing={0.5}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography fontWeight={700}>
                {parsedCallData.section}.{parsedCallData.method}
              </Typography>
              <Link component='button' underline='none' color='primary' onClick={() => setShowDetail(!showDetail)}>
                {showDetail ? 'Hide' : 'Details'}
              </Link>
            </Box>

            <Box sx={{ borderRadius: 1, border: '1px solid', borderColor: 'grey.300', padding: 1 }}>
              <CallComp registry={api.registry} from={sending} call={parsedCallData} jsonFallback />
            </Box>

            {showDetail && (
              <Box sx={{ borderRadius: 1, bgcolor: 'secondary.main', padding: 1 }}>
                <JsonView data={parsedCallData.toHuman()} />
              </Box>
            )}
          </Stack>
        )}

        <Divider />

        <Button variant='contained' color='primary' disabled={!parsedCallData} onClick={handleClick}>
          Submit
        </Button>
      </Stack>
    </Paper>
  );
}

export default PageExtrinsic;
