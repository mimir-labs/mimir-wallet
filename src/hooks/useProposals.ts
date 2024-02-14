// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { chainLinks } from '@mimir-wallet/utils';
import { useMemo } from 'react';
import useSWR from 'swr';

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
  const { data } = useSWR(chainLinks.proposalApi || null, (key) => fetch(key).then((res) => res.json()));

  return useMemo(() => data?.items || [], [data]);
}
