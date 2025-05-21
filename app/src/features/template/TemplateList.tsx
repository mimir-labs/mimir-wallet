// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

import IconAdd from '@/assets/svg/icon-add-fill.svg?react';
import IconClose from '@/assets/svg/icon-close.svg?react';
import IconQuestion from '@/assets/svg/icon-question-fill.svg?react';
import { Empty, InputNetwork } from '@/components';

import { useApi } from '@mimir-wallet/polkadot-core';
import { Button, Divider, Tooltip } from '@mimir-wallet/ui';

import TemplateItem from './TemplateItem';
import { useSavedTemplate } from './useSavedTemplate';

function TemplateList({
  onAdd,
  onClose,
  onView,
  setNetwork
}: {
  onAdd: () => void;
  onClose: () => void;
  onView: (name: string, call: HexString) => void;
  setNetwork: (network: string) => void;
}) {
  const { network } = useApi();
  const { template, removeTemplate, editTemplateName } = useSavedTemplate(network);

  return (
    <div className='space-y-5 h-full'>
      <div className='flex gap-1 items-center'>
        <h4>Call Template</h4>
        <Tooltip
          content='Save frequently used on-chain operation templates for repeated use in the future.'
          closeDelay={0}
        >
          <IconQuestion />
        </Tooltip>

        <div className='flex-1' />

        <Button variant='ghost' color='primary' endContent={<IconAdd className='w-4 h-4' />} onPress={onAdd}>
          Add
        </Button>
        <Button isIconOnly color='primary' variant='ghost' onPress={onClose}>
          <IconClose />
        </Button>
      </div>

      <InputNetwork network={network} setNetwork={setNetwork} />

      <Divider />

      <div className='space-y-2.5 h-full overflow-auto scrollbar-hide'>
        {template.length > 0 && <p>Saved</p>}
        {template.length > 0 ? (
          template.map(({ name, call }, index) => (
            <TemplateItem
              key={index}
              name={name}
              call={call}
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
