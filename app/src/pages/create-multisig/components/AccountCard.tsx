// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAddressMeta } from '@/accounts/useAddressMeta';
import { CopyAddress, EditableField, IdentityIcon } from '@/components';
import React, { useEffect } from 'react';

interface AccountCardProps {
  label: string;
  address?: string;
  onNameChange: (name: string) => void;
  placeholder?: string;
}

function AccountCard({ label, address, onNameChange, placeholder }: AccountCardProps) {
  const { name, setName } = useAddressMeta(address);

  useEffect(() => {
    onNameChange(name);
  }, [name, onNameChange]);

  return (
    <div className='flex flex-col gap-[5px]'>
      <label className='text-foreground text-sm font-bold'>{label}</label>
      <div className='bg-primary/5 rounded-[10px] p-2.5'>
        <div className='flex items-center gap-[10px]'>
          <IdentityIcon size={40} value={address} />
          <div className='flex flex-1 flex-col gap-[5px]'>
            <EditableField
              value={name}
              onChange={setName}
              placeholder={placeholder}
              className='text-foreground text-sm font-bold'
            />
            {address && (
              <div className='flex items-center gap-[5px]'>
                <span className='text-foreground/50 text-xs'>{address}</span>
                <CopyAddress address={address} className='opacity-30' />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(AccountCard);
