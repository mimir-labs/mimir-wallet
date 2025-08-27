// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Call } from '@polkadot/types/interfaces';
import type { FeatureError } from '../shared/error-handling';

import { Input, InputNetwork } from '@/components';
import JsonView from '@/components/JsonView';
import { events } from '@/events';
import { useInputNetwork } from '@/hooks/useInputNetwork';
import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';

import { SubApiRoot, useApi } from '@mimir-wallet/polkadot-core';
import { Button } from '@mimir-wallet/ui';

import { ErrorDisplay } from '../shared/ErrorDisplay';
import DotConsoleButton from './DotConsoleButton';
import { decodeCallData } from './utils';

// CallDataView ref interface for external control
export interface CallDataViewRef {
  setNetwork: (network: string) => void;
  setCallData: (calldata: string) => void;
}

function CallDataViewerContent({
  network,
  calldata,
  setNetwork,
  setCallData
}: {
  network: string;
  calldata: string;
  setNetwork: (value: string) => void;
  setCallData: (value: string) => void;
}) {
  const { api } = useApi();
  const [parsedCallData, setParsedCallData] = useState<Call | null>(null);
  const [callDataError, setCallDataError] = useState<FeatureError | null>(null);

  useEffect(() => {
    const [call, error] = decodeCallData(api.registry, calldata);

    setParsedCallData(call);
    setCallDataError(error);
  }, [api.registry, calldata]);

  return (
    <div className='h-full space-y-5'>
      <div className='flex items-center justify-between'>
        <h4>Call Data Details</h4>
      </div>

      <InputNetwork network={network} setNetwork={setNetwork} />

      <Input label='Call Data' placeholder='0x...' onChange={setCallData} value={calldata} />

      <ErrorDisplay error={callDataError} showDetails={process.env.NODE_ENV === 'development'} />

      {parsedCallData && (
        <div className='bg-secondary rounded-[10px] p-2.5'>
          <JsonView data={parsedCallData.toHuman()} collapseStringsAfterLength={20} />
        </div>
      )}

      {parsedCallData && (
        <>
          <Button
            fullWidth
            onClick={() => {
              events.emit('template_add', network, parsedCallData.toHex());
            }}
            color='primary'
            variant='ghost'
          >
            Add To Template
          </Button>
          <DotConsoleButton variant='ghost' network={network} call={parsedCallData.toHex()} />
        </>
      )}
    </div>
  );
}

const CallDataViewer = forwardRef<CallDataViewRef, { calldata?: string }>(({ calldata: initialCallData }, ref) => {
  const [network, setNetwork] = useInputNetwork();
  const [calldata, setCallData] = useState(initialCallData || '');

  // Expose methods to parent via ref
  useImperativeHandle(
    ref,
    () => ({
      setNetwork: setNetwork,
      setCallData: setCallData
    }),
    [setNetwork]
  );

  return (
    <SubApiRoot network={network}>
      <CallDataViewerContent network={network} calldata={calldata} setNetwork={setNetwork} setCallData={setCallData} />
    </SubApiRoot>
  );
});

CallDataViewer.displayName = 'CallDataViewer';

export default React.memo(CallDataViewer);
