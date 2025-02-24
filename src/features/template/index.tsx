// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

import { useState } from 'react';

import AddTemplate from './AddTemplate';
import TemplateList from './TemplateList';

function Template({ defaultAdded, defaultCallData }: { defaultAdded?: boolean; defaultCallData?: HexString }) {
  const [isAdd, setIsAdd] = useState(defaultAdded || false);

  if (isAdd) return <AddTemplate defaultCallData={defaultCallData} onBack={() => setIsAdd(false)} />;

  return <TemplateList onAdd={() => setIsAdd(true)} />;
}

export default Template;
