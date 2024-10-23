// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Codec, TypeDef } from '@polkadot/types/types';

export interface ParamProps {
  name?: string;
  type: TypeDef;
  value: Codec;
}
export type ComponentMap = Record<string, React.ComponentType<ParamProps>>;
