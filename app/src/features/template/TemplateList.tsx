// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Registry } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';

import IconAdd from '@/assets/svg/icon-add-fill.svg?react';
import IconQuestion from '@/assets/svg/icon-question-fill.svg?react';
import { Empty, InputNetwork } from '@/components';

import { useApi } from '@mimir-wallet/polkadot-core';
import { Button, Divider, Tooltip } from '@mimir-wallet/ui';

import TemplateItem from './TemplateItem';
import TemplateMigrationAlert from './TemplateMigrationAlert';
import { useSavedTemplate } from './useSavedTemplate';

function TemplateList({
  registry,
  onAdd,
  onView,
  setNetwork
}: {
  registry: Registry;
  onAdd: () => void;
  onView: (name: string, call: HexString) => void;
  setNetwork: (network: string) => void;
}) {
  const { network } = useApi();
  const { template, removeTemplate, editTemplateName } = useSavedTemplate(network);

  const handleMigrationComplete = () => {
    // Refresh templates after migration is complete
    // The template list will automatically update via the useSavedTemplate hook
  };

  return (
    <div className='scrollbar-hide flex h-full flex-col gap-5 overflow-y-auto'>
      <div className='flex items-center gap-1'>
        <h4>Call Template</h4>
        <Tooltip content='Save frequently used on-chain operation templates for repeated use in the future.'>
          <IconQuestion />
        </Tooltip>

        <div className='flex-1' />

        <Button variant='ghost' color='primary' onClick={onAdd}>
          Add
          <IconAdd className='h-4 w-4' />
        </Button>
      </div>

      <InputNetwork network={network} setNetwork={setNetwork} />

      <TemplateMigrationAlert chain={network} templates={template} onMigrationComplete={handleMigrationComplete} />

      <Divider />

      <div className='scrollbar-hide flex-1 space-y-2.5 overflow-auto'>
        {template.length > 0 && <p>Saved</p>}
        {template.length > 0 ? (
          template.map(({ name, call }, index) => (
            <TemplateItem
              key={index}
              name={name}
              call={call}
              registry={registry}
              onEditName={(name) => editTemplateName(index, name)}
              onView={onView}
              onDelete={() => removeTemplate(index)}
            />
          ))
        ) : (
          <Empty height={300} label='No saved template' />
        )}
      </div>
    </div>
  );
}

export default TemplateList;
