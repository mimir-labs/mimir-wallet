// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

import { events } from '@/events';
import { useEffect, useState } from 'react';

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
  const [isAdd, setIsAdd] = useState(defaultAdded);
  const [isView, setIsView] = useState(false);
  const [viewTemplate, setViewTemplate] = useState<HexString | undefined>(undefined);
  const [viewTemplateName, setViewTemplateName] = useState<string | undefined>(undefined);

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

  if (isView)
    return (
      <AddTemplate
        isView
        defaultCallData={viewTemplate}
        defaultName={viewTemplateName}
        onBack={() => setIsView(false)}
      />
    );

  return (
    <TemplateList
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
