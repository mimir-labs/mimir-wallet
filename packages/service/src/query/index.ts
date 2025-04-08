// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

export { default as QueryProvider } from './QueryProvider.js';

export {
  useQuery,
  useQueries,
  useQueryClient,
  useInfiniteQuery,
  useIsFetching,
  useIsMutating,
  useIsRestoring,
  useMutation,
  useMutationState,
  useQueryErrorResetBoundary,
  type QueriesOptions
} from '@tanstack/react-query';
