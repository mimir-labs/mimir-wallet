// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Codec, Registry, TypeDef } from '@polkadot/types/types';

export interface ParamProps {
  registry: Registry;
  name?: string;
  displayType?: 'horizontal' | 'vertical';
  type: TypeDef;
  value: Codec;
  overrides?: ComponentMap;
}
export type ComponentMap = Record<string, React.ComponentType<ParamProps>>;
