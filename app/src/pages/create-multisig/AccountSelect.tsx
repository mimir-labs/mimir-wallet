// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import IconAdd from '@/assets/svg/icon-add.svg?react';
import IconDelete from '@/assets/svg/icon-delete.svg?react';
import IconQuestion from '@/assets/svg/icon-question-fill.svg?react';
import { AddressRow } from '@/components';
import { hexToU8a } from '@polkadot/util';
import React from 'react';

import { addressEq } from '@mimir-wallet/polkadot-core';
import { Button, Tooltip } from '@mimir-wallet/ui';

interface Props {
  title: string;
  type: 'add' | 'delete';
  disabled?: boolean;
  accounts: string[];
  onClick: (value: string) => void;
}

function AccountSelect({ accounts, disabled, onClick, title, type }: Props) {
  return (
    <div className='flex flex-1 flex-col'>
      <p>
        <b>{title}</b>
      </p>
      <div className='space-y-2.5 overflow-y-auto max-h-[200px] mt-1 p-2.5 flex-1 border-1 border-secondary rounded-medium bg-content1'>
        {accounts.map((account, index) => (
          <div
            key={index}
            className='flex items-center justify-between rounded-small p-1 bg-secondary [&>.AddressRow]:flex-1'
          >
            <AddressRow iconSize={24} value={account} />
            {addressEq(hexToU8a('0x0', 256), account) && (
              <Tooltip
                classNames={{ content: 'max-w-[500px] break-all' }}
                content='The SS58 address for 0x0000000000000000000000000000000000000000000000000000000000000000 which cannot be controlled.'
              >
                <IconQuestion />
              </Tooltip>
            )}
            <Button
              isIconOnly
              isDisabled={disabled}
              variant='light'
              color={type === 'add' ? 'primary' : 'danger'}
              onPress={() => onClick(account)}
              size='sm'
              className='w-[26px] h-[26px] min-w-[0px] min-h-[0px]'
            >
              {type === 'add' ? <IconAdd className='w-4 h-4' /> : <IconDelete className='w-4 h-4' />}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default React.memo(AccountSelect);
