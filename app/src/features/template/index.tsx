// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

import { events } from '@/events';
import { useEffect, useState } from 'react';

import { useApi } from '@mimir-wallet/polkadot-core';

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
  const { network, setNetwork } = useApi();
  const [isAdd, setIsAdd] = useState(defaultAdded);
  const [isView, setIsView] = useState(false);
  const [viewTemplate, setViewTemplate] = useState<HexString | undefined>(undefined);
  const [viewTemplateName, setViewTemplateName] = useState<string | undefined>(undefined);

  useEffect(() => {
    const handleTemplateAdd = (network: string, callData: HexString) => {
      setIsAdd(true);
      setNetwork(network);
      setViewTemplate(callData);
    };

    events.on('template_add', handleTemplateAdd);

    return () => {
      events.off('template_add', handleTemplateAdd);
    };
  }, [setNetwork]);

  if (isAdd) return <AddTemplate key={network} defaultCallData={defaultCallData} onBack={() => setIsAdd(false)} />;

  if (isView)
    return (
      <AddTemplate
        key={network}
        isView
        defaultCallData={viewTemplate}
        defaultName={viewTemplateName}
        onBack={() => setIsView(false)}
      />
    );

  return (
    <TemplateList
      key={network}
      onAdd={() => setIsAdd(true)}
      onClose={onClose}
      onView={(name, call) => {
        setViewTemplate(call);
        setViewTemplateName(name);
        setIsView(true);
      }}
    />
  );
}

export default Template;
