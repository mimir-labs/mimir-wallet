// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

export interface TransferToken {
  isNative: boolean;
  assetId: string;
  name: string;
  symbol: string;
  decimals: number;
  icon: string;
}
