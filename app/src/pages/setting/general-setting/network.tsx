// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import {
  type Endpoint,
  NETWORK_RPC_PREFIX,
  useChains,
  useNetwork,
} from '@mimir-wallet/polkadot-core';
import { store } from '@mimir-wallet/service';
import {
  Alert,
  AlertTitle,
  Button,
  buttonSpinner,
  Combobox,
  type ComboboxOption,
  Divider,
  Spinner,
} from '@mimir-wallet/ui';
import { WsProvider } from '@polkadot/api';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useAsyncFn } from 'react-use';

import { InputNetwork } from '@/components';
import { isValidWsUrl } from '@/utils';

// Latency thresholds for color coding
const LATENCY_THRESHOLDS = {
  LOW: 200,
  MEDIUM: 500,
} as const;

/**
 * Test WebSocket endpoint latency by measuring connection time
 */
async function testWsLatency(
  wsUrl: string,
  timeout = 10000,
): Promise<number | null> {
  const startTime = performance.now();

  return new Promise((resolve) => {
    const ws = new WebSocket(wsUrl);
    const timer = setTimeout(() => {
      ws.close();
      resolve(null);
    }, timeout);

    ws.onopen = () => {
      clearTimeout(timer);
      const latency = Math.round(performance.now() - startTime);

      ws.close();
      resolve(latency);
    };

    ws.onerror = () => {
      clearTimeout(timer);
      ws.close();
      resolve(null);
    };
  });
}

/**
 * Latency indicator component with color coding
 * Each instance tests its own endpoint
 */
function LatencyIndicator({ wsUrl }: { wsUrl: string }) {
  const {
    data: latency,
    isPending,
    isError,
  } = useQuery({
    queryKey: ['ws-latency', wsUrl],
    queryFn: ({ queryKey: [, wsUrl] }) => testWsLatency(wsUrl),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  });

  if (isPending) {
    return (
      <Spinner size={14} color="current" className="text-muted-foreground" />
    );
  }

  if (isError || latency === null) {
    return <span className="text-muted-foreground text-xs">--</span>;
  }

  const colorClass =
    latency < LATENCY_THRESHOLDS.LOW
      ? 'text-success'
      : latency < LATENCY_THRESHOLDS.MEDIUM
        ? 'text-warning'
        : 'text-danger';

  return (
    <span className={`text-xs font-medium ${colorClass}`}>{latency}ms</span>
  );
}

function Content({ chain }: { chain: Endpoint }) {
  const [url, setUrl] = useState(
    (store.get(`${NETWORK_RPC_PREFIX}${chain.key}`) as string) ||
      Object.values(chain.wsUrl)[0] ||
      '',
  );

  const [error, setError] = useState<Error | undefined>(undefined);

  const [state, handleSave] = useAsyncFn(async () => {
    if (!isValidWsUrl(url)) {
      setError(new Error('Invalid URL, expect ws:// or wss://'));

      return;
    }

    const provider = new WsProvider(url);

    try {
      // Create a timeout promise that rejects after 30 seconds
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Connection timeout (30s)'));
        }, 30000);
      });

      // Race between provider connection and timeout
      const rpcGenesisHash = await Promise.race([
        provider.isReady.then(() => {
          return provider.send('chain_getBlockHash', [0]);
        }),
        timeoutPromise,
      ]);

      if (rpcGenesisHash !== chain.genesisHash) {
        setError(new Error('Genesis hash mismatch'));
        provider.disconnect();

        return;
      }

      provider.disconnect();

      store.set(`${NETWORK_RPC_PREFIX}${chain.key}`, url);
    } catch (error) {
      // Ensure provider is disconnected on any error
      provider.disconnect();
      setError(error instanceof Error ? error : new Error('Unknown error'));
    }
  }, [url, chain.genesisHash, chain.key]);

  // Convert wsUrl entries to combobox options
  const rpcOptions: ComboboxOption[] = Object.entries(chain.wsUrl).map(
    ([name, wsUrl]) => ({
      value: wsUrl,
      label: name,
    }),
  );

  const handleValueChange = (value: string) => {
    setUrl(value);
    setError(undefined);
  };

  // Validate custom RPC URL
  const validateRpcUrl = (value: string): boolean => isValidWsUrl(value);

  return (
    <>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Network RPC</label>
        <Combobox
          options={rpcOptions}
          value={url}
          onValueChange={handleValueChange}
          placeholder="Please select or input rpc url ws:// or wss://"
          searchPlaceholder="Search or enter custom RPC URL..."
          emptyMessage="No matching RPC endpoints"
          allowCustomValue
          validateCustomValue={validateRpcUrl}
          renderOption={(option, isSelected) => (
            <>
              <span className={isSelected ? 'opacity-100' : 'opacity-0'}>
                ✓
              </span>
              <div className="ml-2 flex flex-1 items-center justify-between gap-2">
                <span className="flex-1 truncate text-sm">{option.value}</span>
                <div className="flex shrink-0 items-center gap-2">
                  <LatencyIndicator wsUrl={option.value} />
                  <span className="text-muted-foreground text-right text-xs">
                    {option.label}
                  </span>
                </div>
              </div>
            </>
          )}
          renderValue={(value) => (
            <div className="flex flex-1 items-center justify-between gap-2">
              <span className="flex-1 truncate">{value}</span>
              <LatencyIndicator wsUrl={value} />
            </div>
          )}
        />
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertTitle>{error.message}</AlertTitle>
        </Alert>
      )}

      <Divider />

      <Button disabled={!url || state.loading} fullWidth onClick={handleSave}>
        {state.loading ? buttonSpinner : undefined}
        Save
      </Button>
    </>
  );
}

function NetworkSetting() {
  const { chains: networks } = useChains();
  const { network: defaultNetwork } = useNetwork();
  const [network, setNetwork] = useState(defaultNetwork);

  const chain = networks.find((item) => item.key === network);

  return (
    <div className="card-root flex flex-col gap-5 p-5">
      <InputNetwork
        showAllNetworks
        label="Select Network"
        network={network}
        setNetwork={setNetwork}
      />

      {chain && <Content key={chain.key} chain={chain} />}
    </div>
  );
}

export default NetworkSetting;
