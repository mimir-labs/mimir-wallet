// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

import { useEffect, useState } from 'react';

import { events } from '@mimir-wallet/events';

import AddTemplate from './AddTemplate';
import TemplateList from './TemplateList';

function Template({
  defaultAdded,
  defaultCallData,
  onClose
}: {
  defaultAdded?: boolean;
  defaultCallData?: HexString;
  onClose: () => void;
}) {
  const [isAdd, setIsAdd] = useState(defaultAdded || false);

  useEffect(() => {
    const handleTemplateAdd = () => {
      setIsAdd(true);
    };

    events.on('template_add', handleTemplateAdd);

    return () => {
      events.off('template_add', handleTemplateAdd);
    };
  }, []);

  if (isAdd) return <AddTemplate defaultCallData={defaultCallData} onBack={() => setIsAdd(false)} />;

  return <TemplateList onAdd={() => setIsAdd(true)} onClose={onClose} />;
}

export default Template;
