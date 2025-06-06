// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

export type PrepareFlexible = {
  creator?: string | null;
  who: string[];
  threshold: number;
  name: string;
  pure?: string | null;
  blockNumber?: number | null;
  extrinsicIndex?: number | null;
  multisigName?: string | null;
};
