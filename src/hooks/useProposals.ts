// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { chainLinks } from '@mimir-wallet/api/chain-links';

export interface ProposalData {
  referendumIndex: number;
  proposer: string;
  title: string | null;
  commentsCount: number;
  state: {
    name: string;
  };
  onchainData: {
    trackInfo?: {
      name: string;
    };
  };
}

export function useProposal(): ProposalData[] {
  const proposalApi = chainLinks.proposalApi();
  const { data } = useQuery<{ items: ProposalData[] }>({
    queryHash: `${proposalApi}`,
    queryKey: [proposalApi || null]
  });

  return useMemo(() => data?.items || [], [data]);
}
