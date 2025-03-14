// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRef } from 'react';

import { fetcher } from '../fetcher.js';

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useRef(
    new QueryClient({
      defaultOptions: {
        queries: {
          refetchInterval: 6_000,
          queryFn: ({ queryKey }) => (queryKey[0] ? fetcher(queryKey[0] as string) : null)
        }
      }
    })
  );

  return <QueryClientProvider client={queryClient.current}>{children}</QueryClientProvider>;
}
