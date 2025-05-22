// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Call } from '@polkadot/types/interfaces';
import type { Registry } from '@polkadot/types/types';

import { ErrorBoundary, Input, InputAddress, InputNetwork, TxButton } from '@/components';
import JsonView from '@/components/JsonView';
import { events } from '@/events';
import { useInput } from '@/hooks/useInput';
import { Call as CallComp } from '@/params';
import { useEffect, useState } from 'react';

import { useApi } from '@mimir-wallet/polkadot-core';
import { Divider, Link } from '@mimir-wallet/ui';

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
    <div className='w-full max-w-[500px] mx-auto mt-3 p-5 rounded-large border-1 border-secondary bg-content1 shadow-medium'>
      <div className='space-y-5'>
        <h3>Submit Extrinsic</h3>

        <InputNetwork label='Select Network' network={network} setNetwork={setNetwork} />

        <InputAddress isSign label='Sending From' onChange={setSending} placeholder='Sender' value={sending} />

        <Input
          label={
            <div className='flex items-center justify-between gap-1'>
              Call Data
              <Link as='button' underline='none' color='primary' onPress={() => events.emit('template_open', network)}>
                View Template
              </Link>
            </div>
          }
          placeholder='0x...'
          color={callDataError ? 'danger' : 'primary'}
          helper={
            <div className='text-foreground mt-1'>
              You can paste the Encoded Call Data in{' '}
              <Link underline='hover' target='_blank'>
                DOT Console
              </Link>
              /
              <Link underline='hover' target='_blank'>
                Polkadot.JS
              </Link>
              .
            </div>
          }
          value={callData}
          onChange={setCallData}
        />

        {callDataError && (
          <div className='bg-secondary p-2.5 rounded-medium break-all'>
            <p style={{ fontFamily: 'Geist Mono' }} className='text-danger text-tiny'>
              {callDataError.message}
            </p>
          </div>
        )}

        {parsedCallData && (
          <div className='space-y-[5px]'>
            <div className='flex justify-between items-center'>
              <p className='font-bold'>
                {parsedCallData.section}.{parsedCallData.method}
              </p>
              <Link as='button' underline='none' color='primary' onPress={() => setShowDetail(!showDetail)}>
                {showDetail ? 'Hide' : 'Details'}
              </Link>
            </div>

            <div className='rounded-medium border-1 border-divider-300 p-2.5'>
              <ErrorBoundary>
                <CallComp registry={api.registry} from={sending} call={parsedCallData} jsonFallback />
              </ErrorBoundary>
            </div>

            {showDetail && (
              <div className='rounded-medium bg-secondary p-2.5'>
                <JsonView data={parsedCallData.toHuman()} />
              </div>
            )}
          </div>
        )}

        <Divider />

        <TxButton
          fullWidth
          variant='solid'
          color='primary'
          isDisabled={!parsedCallData}
          accountId={sending}
          website='mimir://internal/template'
          getCall={parsedCallData ? () => parsedCallData : undefined}
        >
          Submit
        </TxButton>
      </div>
    </div>
  );
}

export default Extrinsic;
