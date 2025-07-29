// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccount } from '@/accounts/useAccount';
import DeleteIcon from '@/assets/svg/icon-delete.svg?react';
import { Empty, InputAddress } from '@/components';
import AddressRow from '@/components/AddressRow';
import { useState } from 'react';

import { Alert, Button, Divider, Select, SelectItem } from '@mimir-wallet/ui';

interface Step2MembersProps {
  members: string[];
  threshold: number;
  onMembersChange: (members: string[]) => void;
  onThresholdChange: (threshold: number) => void;
  onNext: () => void;
  onBack: () => void;
}

function Step2Members({ members, onBack, onMembersChange, onNext, onThresholdChange, threshold }: Step2MembersProps) {
  const { isLocalAccount, isLocalAddress, addAddressBook } = useAccount();
  const [selectedAccount, setSelectedAccount] = useState<string>('');

  const handleAddMember = () => {
    if (selectedAccount && !members.find((m) => m === selectedAccount)) {
      onMembersChange([...members, selectedAccount]);
      setSelectedAccount('');

      if (!isLocalAccount(selectedAccount) && !isLocalAddress(selectedAccount)) {
        addAddressBook(selectedAccount, false);
      }
    }
  };

  const handleRemoveMember = (address: string) => {
    onMembersChange(members.filter((m) => m !== address));

    // Adjust threshold if necessary
    if (threshold > members.length - 1) {
      onThresholdChange(Math.max(1, members.length - 1));
    }
  };

  const handleSelect = (address: string) => {
    if (address && !members.find((m) => m === address)) {
      onMembersChange([...members, address]);

      if (!isLocalAccount(address) && !isLocalAddress(address)) {
        addAddressBook(address, false);
      }
    }

    return false;
  };

  return (
    <div className='flex flex-col gap-4'>
      {/* Add New Signers Section */}
      <InputAddress
        withAddButton
        label='Add New Signers'
        wrapperClassName='!h-10'
        addressType='row'
        iconSize={20}
        value={selectedAccount}
        onChange={setSelectedAccount}
        onSelect={handleSelect}
        excluded={members}
        placeholder='Select account'
        withZeroAddress
        endContent={
          <Button
            className='h-10 min-w-[53px]'
            size='md'
            color='primary'
            onPress={handleAddMember}
            isDisabled={!selectedAccount}
          >
            Add
          </Button>
        }
      />

      {/* Multisig Signers List */}
      <div className='flex flex-col gap-1'>
        <label className='text-foreground text-sm font-bold'>Multisig Signers</label>
        <div className='rounded-medium border-divider-300 flex flex-col gap-2.5 border p-2.5'>
          {members.length > 0 ? (
            members.map((member) => (
              <div key={member} className='rounded-small bg-secondary flex items-center gap-1 px-1 py-1'>
                <AddressRow
                  className='[&_.AddressRow-Address]:text-[#949494]'
                  value={member}
                  withAddress
                  withName
                  iconSize={20}
                />
                <div className='flex-1' />
                <button
                  onClick={() => handleRemoveMember(member)}
                  className='text-danger p-1 transition-opacity hover:opacity-80'
                >
                  <DeleteIcon />
                </button>
              </div>
            ))
          ) : (
            <Empty height={100} variant='select-account' />
          )}
        </div>
      </div>

      {/* Set Approval Threshold */}
      <div className='flex flex-col gap-1'>
        <label className='text-foreground text-sm font-bold'>Set Approval Threshold</label>
        <p className='text-foreground/50 text-tiny'>Any transaction requires the confirmation of:</p>
        <div className='flex items-center gap-2.5'>
          <Select
            size='sm'
            selectedKeys={[threshold.toString()]}
            selectionMode='single'
            onSelectionChange={(keys) => {
              const value = Array.from(keys)[0];

              if (value) onThresholdChange(parseInt(value as string));
            }}
            variant='bordered'
            className='w-20'
            classNames={{
              trigger: 'border-divider-300'
            }}
          >
            {Array.from({ length: Math.max(1, members.length) }, (_, i) => i + 1).map((num) => (
              <SelectItem textValue={num.toString()} key={num.toString()}>
                {num}
              </SelectItem>
            ))}
          </Select>
          <span className='text-foreground text-sm'>out of {members.length || 1} Signers</span>
        </div>
      </div>

      {/* Tips Alert */}
      {threshold === 1 && members.length > 0 && (
        <Alert
          color='warning'
          title='Tips'
          classNames={{ title: 'font-bold text-medium text-foreground', description: 'text-foreground/50 text-tiny' }}
          description={
            <ul style={{ listStyle: 'outside', lineHeight: '14px' }}>
              <li>
                Mimir support 1/N multisig which bring more flexibility and also more risks. Each member can transfer
                funds out.
              </li>
            </ul>
          }
        />
      )}

      {/* Divider */}
      <Divider className='bg-secondary' />

      {/* Action Buttons */}
      <div className='flex gap-2.5'>
        <Button fullWidth size='md' variant='ghost' color='primary' radius='full' onPress={onBack}>
          Back
        </Button>
        <Button fullWidth size='md' color='primary' radius='full' onPress={onNext} isDisabled={members.length === 0}>
          Next
        </Button>
      </div>
    </div>
  );
}

export default Step2Members;
