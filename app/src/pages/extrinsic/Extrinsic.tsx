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
import { Divider } from '@mimir-wallet/ui';

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
    <div className='border-secondary bg-content1 shadow-medium mx-auto mt-3 w-full max-w-[500px] rounded-[20px] border-1 p-5'>
      <div className='space-y-5'>
        <h3>Submit Extrinsic</h3>

        <InputNetwork label='Select Network' network={network} setNetwork={setNetwork} />

        <InputAddress isSign label='Sending From' onChange={setSending} placeholder='Sender' value={sending} />

        <Input
          label={
            <div className='flex items-center justify-between gap-1'>
              Call Data
              <button className='text-primary hover:underline' onClick={() => events.emit('template_open', network)}>
                View Template
              </button>
            </div>
          }
          placeholder='0x...'
          color={callDataError ? 'danger' : 'primary'}
          helper={
            <div className='text-foreground mt-1'>
              You can paste the Encoded Call Data in{' '}
              <a className='hover:underline' target='_blank' rel='noopener noreferrer'>
                DOT Console
              </a>
              /
              <a className='hover:underline' target='_blank' rel='noopener noreferrer'>
                Polkadot.JS
              </a>
              .
            </div>
          }
          value={callData}
          onChange={setCallData}
        />

        {callDataError && (
          <div className='bg-secondary rounded-[10px] p-2.5 break-all'>
            <p style={{ fontFamily: 'Geist Mono' }} className='text-danger text-xs'>
              {callDataError.message}
            </p>
          </div>
        )}

        {parsedCallData && (
          <div className='space-y-[5px]'>
            <div className='flex items-center justify-between'>
              <p className='font-bold'>
                {parsedCallData.section}.{parsedCallData.method}
              </p>
              <button className='text-primary hover:underline' onClick={() => setShowDetail(!showDetail)}>
                {showDetail ? 'Hide' : 'Details'}
              </button>
            </div>

            <div className='border-divider-300 rounded-[10px] border-1 p-2.5'>
              <ErrorBoundary>
                <CallComp showFallback registry={api.registry} from={sending} call={parsedCallData} />
              </ErrorBoundary>
            </div>

            {showDetail && (
              <div className='bg-secondary rounded-[10px] p-2.5'>
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
          disabled={!parsedCallData}
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
