// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NetworkProvider, useChains } from '@mimir-wallet/polkadot-core';
import { Button, Skeleton } from '@mimir-wallet/ui';
import React, { useImperativeHandle, useMemo, useState } from 'react';

import { handleDecodeError } from '../shared/error-handling';
import { ErrorDisplay } from '../shared/ErrorDisplay';

import DotConsoleButton from './DotConsoleButton';

import { Input, InputNetwork, NetworkErrorAlert } from '@/components';
import JsonView from '@/components/JsonView';
import { events } from '@/events';
import { useParseCall } from '@/hooks/useParseCall';

// CallDataView ref interface for external control
export interface CallDataViewRef {
  setNetwork: (network: string) => void;
  setCallData: (calldata: string) => void;
}

function CallDataViewerContent({
  network,
  calldata,
  setNetwork,
  setCallData,
}: {
  network: string;
  calldata: string;
  setNetwork: (value: string) => void;
  setCallData: (value: string) => void;
}) {
  // Parse call data using async hook
  const {
    call: parsedCallData,
    isLoading,
    error,
  } = useParseCall(network, calldata);

  // Convert standard Error to FeatureError for ErrorDisplay
  const callDataError = useMemo(
    () => (error ? handleDecodeError(error, 'call data decoding') : null),
    [error],
  );

  return (
    <div className="h-full space-y-5">
      <div className="flex items-center justify-between">
        <h4>Call Data Details</h4>
      </div>

      <InputNetwork showAllNetworks network={network} setNetwork={setNetwork} />

      <Input
        label="Call Data"
        placeholder="0x..."
        onChange={setCallData}
        value={calldata}
      />

      <ErrorDisplay
        error={callDataError}
        showDetails={process.env.NODE_ENV === 'development'}
      />

      <NetworkErrorAlert network={network} />

      {!parsedCallData && isLoading && <Skeleton className="h-[200px]" />}

      {parsedCallData && (
        <div className="bg-secondary rounded-[10px] p-2.5">
          <JsonView
            data={parsedCallData.toHuman()}
            collapseStringsAfterLength={20}
          />
        </div>
      )}

      {parsedCallData && (
        <>
          <Button
            fullWidth
            onClick={() => {
              events.emit('template_add', network, parsedCallData.toHex());
            }}
            color="primary"
            variant="ghost"
          >
            Add To Template
          </Button>
          <DotConsoleButton
            variant="ghost"
            network={network}
            call={parsedCallData.toHex()}
          />
        </>
      )}
    </div>
  );
}

interface CallDataViewerProps {
  calldata?: string;
  ref?: React.Ref<CallDataViewRef>;
}

function CallDataViewer({
  calldata: initialCallData,
  ref,
}: CallDataViewerProps) {
  const { chains } = useChains();
  const [network, setNetwork] = useState(chains[0].key);
  const [calldata, setCallData] = useState(initialCallData || '');

  // Expose methods to parent via ref
  useImperativeHandle(
    ref,
    () => ({
      setNetwork: setNetwork,
      setCallData: setCallData,
    }),
    [setNetwork],
  );

  return (
    <NetworkProvider network={network}>
      <CallDataViewerContent
        network={network}
        calldata={calldata}
        setNetwork={setNetwork}
        setCallData={setCallData}
      />
    </NetworkProvider>
  );
}

CallDataViewer.displayName = 'CallDataViewer';

export default React.memo(CallDataViewer);
