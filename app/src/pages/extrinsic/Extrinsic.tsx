// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Call } from '@polkadot/types/interfaces';
import type { Registry } from '@polkadot/types/types';

import { Input, InputAddress, InputNetwork, TxButton } from '@/components';
import JsonView from '@/components/JsonView';
import { events } from '@/events';
import { useInput } from '@/hooks/useInput';
import { Call as CallComp } from '@/params';
import { Box, Divider, Paper, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

import { useApi } from '@mimir-wallet/polkadot-core';
import { Link } from '@mimir-wallet/ui';

function decodeCallData(registry: Registry, callData: string): [Call | null, Error | null] {
  if (!callData) return [null, null];

  try {
    const call = registry.createType('Call', callData);

    return [call, null];
  } catch (error) {
    return [null, error as Error];
  }
}

function Extrinsic({
  sending,
  setSending,
  network,
  setNetwork
}: {
  sending: string;
  network: string;
  setSending: (sending: string) => void;
  setNetwork: (network: string) => void;
}) {
  const { api } = useApi();
  const [callData, setCallData] = useInput('');
  const [parsedCallData, setParsedCallData] = useState<Call | null>(null);
  const [callDataError, setCallDataError] = useState<Error | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    const [call, error] = decodeCallData(api.registry, callData);

    setParsedCallData(call);
    setCallDataError(error);
  }, [api.registry, callData]);

  return (
    <Paper sx={{ width: '100%', maxWidth: 500, margin: '0 auto', padding: 2.5, borderRadius: '20px', marginTop: 1.25 }}>
      <Stack spacing={2}>
        <Typography variant='h3'>Submit Extrinsic</Typography>

        <InputNetwork label='Select Network' network={network} setNetwork={setNetwork} />

        <InputAddress isSign label='Sending From' onChange={setSending} placeholder='Sender' value={sending} />

        <Input
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.5 }}>
              Call Data
              <Link as='button' underline='none' color='primary' onPress={() => events.emit('template_open', network)}>
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
              <Link as='button' underline='none' color='primary' onPress={() => setShowDetail(!showDetail)}>
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

        <TxButton
          variant='solid'
          color='primary'
          isDisabled={!parsedCallData}
          accountId={sending}
          website='mimir://internal/template'
          getCall={parsedCallData ? () => parsedCallData : undefined}
        >
          Submit
        </TxButton>
      </Stack>
    </Paper>
  );
}

export default Extrinsic;
