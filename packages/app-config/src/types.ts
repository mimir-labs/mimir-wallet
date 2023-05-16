// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

export interface EndpointOption {
  logo?: React.ReactNode;
  specName?: string;
  text: string;
  providers: Record<string, string>;
}

export interface DappOption {
  internal: boolean;
  icon: string;
  name: string;
  description: string;
  url: string;
}
