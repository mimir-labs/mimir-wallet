// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TemplateInfo } from './types';

import { useCallback } from 'react';

import { TEMPLATE_PREFIX } from '@mimir-wallet/constants';
import { useLocalStore } from '@mimir-wallet/hooks/useStore';

export function useSavedTemplate(key: string) {
  const [template, setTemplate] = useLocalStore<TemplateInfo[]>(`${TEMPLATE_PREFIX}:${key}`, []);

  const addTemplate = useCallback(
    (template: TemplateInfo) => {
      setTemplate((templates) => [...templates, template]);
    },
    [setTemplate]
  );

  const removeTemplate = useCallback(
    (index: number) => {
      setTemplate((templates) => templates.filter((t, i) => i !== index));
    },
    [setTemplate]
  );

  const editTemplateName = useCallback(
    (index: number, name: string) => {
      setTemplate((templates) => templates.map((t, i) => (i === index ? { ...t, name } : t)));
    },
    [setTemplate]
  );

  return {
    template,
    addTemplate,
    removeTemplate,
    editTemplateName
  };
}
