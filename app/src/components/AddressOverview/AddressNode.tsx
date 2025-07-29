// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { NodeData } from './context';

import { useAccount } from '@/accounts/useAccount';
import PureIcon from '@/assets/images/pure-icon.svg';
import IconAddressBook from '@/assets/svg/icon-address-book.svg?react';
import IconView from '@/assets/svg/icon-view.svg?react';
import { Handle, type Node, type NodeProps, Position } from '@xyflow/react';
import React, { useContext } from 'react';

import { Avatar, Button, Chip } from '@mimir-wallet/ui';

import Address from '../Address';
import AddressCell from '../AddressCell';
import AddressName from '../AddressName';
import AddressNetworks from '../AddressNetworks';
import CopyAddress from '../CopyAddress';
import IdentityIcon from '../IdentityIcon';
import { context } from './context';

const AddressNode = React.memo(({ data, isConnectable }: NodeProps<Node<NodeData>>) => {
  const { isLocalAccount, isLocalAddress, addAddressBook } = useAccount();
  const { showAddressNodeOperations = true } = useContext(context);
  const isPure = data.account.type === 'pure';
  const isProxied = data.account.delegatees.length > 0;
  const isMultisig = data.account.type === 'multisig';

  let cell: JSX.Element;

  if (data.account.type === 'pure' && data.account.isUnknownPure) {
    cell = data.isTop ? (
      <div className='bg-content1 rounded-medium border-primary/5 shadow-small relative w-[240px] overflow-hidden border-1 p-2.5'>
        <div className='bg-secondary absolute top-0 left-0 z-0 h-[30px] w-full' />
        <div className='z-10 flex h-full w-full flex-col items-center gap-[5px]'>
          <Avatar src={PureIcon} style={{ width: 40 }} />

          <h6>{data.account.name || 'Pending'}</h6>
        </div>
      </div>
    ) : (
      <div className='bg-content1 rounded-medium border-primary/5 shadow-small relative w-[240px] overflow-hidden border-1 p-2.5'>
        <div className={`flex min-w-0 flex-1 items-center gap-2.5`}>
          <Avatar src={PureIcon} style={{ width: 30 }} />
          <div className='flex min-w-0 flex-1 flex-col gap-y-[2px]'>
            <div className='flex min-w-0 items-center gap-1'>
              <span className='min-w-0 overflow-hidden text-left font-bold'>{data.account.name || 'Pending'}</span>
            </div>

            <div className='text-foreground/50 text-tiny flex h-[16px] min-w-0 items-center'>...</div>
          </div>
        </div>
      </div>
    );
  } else {
    cell = data.isTop ? (
      <div className='bg-content1 rounded-medium border-primary/5 shadow-small relative w-[240px] overflow-hidden border-1 p-2.5'>
        <div className='bg-secondary absolute top-0 left-0 z-0 h-[30px] w-full' />
        <div className='z-10 flex h-full w-full flex-col items-center gap-[5px]'>
          <IdentityIcon value={data.account.address} size={40} />

          <h6>
            <AddressName value={data.account.address} />
          </h6>

          <div className='text-foreground/50 text-tiny flex h-[16px] items-center whitespace-nowrap'>
            <div className='mr-1 flex items-center gap-1'>
              <AddressNetworks address={data.account.address} avatarSize={12} />
            </div>
            <span>
              <Address shorten value={data.account.address} />
            </span>
            {showAddressNodeOperations ? (
              <>
                <CopyAddress size='sm' address={data.account.address} className='opacity-50' />

                {!isLocalAccount(data.account.address) && !isLocalAddress(data.account.address) && (
                  <Button
                    isIconOnly
                    color='default'
                    onPress={() => {
                      addAddressBook(data.account.address);
                    }}
                    variant='light'
                    size='sm'
                    className='text-foreground/50 h-[18px] w-[18px] opacity-50'
                  >
                    <IconAddressBook className='h-3 w-3' />
                  </Button>
                )}

                <Button
                  isIconOnly
                  variant='light'
                  color='default'
                  size='sm'
                  className='text-foreground/50 h-[18px] w-[18px] opacity-50'
                  onPress={() => {
                    window.open(`${window.location.origin}?address=${data.account.address}&tab=structure`, '_blank');
                  }}
                >
                  <IconView />
                </Button>
              </>
            ) : null}
          </div>

          <div className='flex items-center'>
            {isMultisig && (
              <Chip color='secondary' size='sm'>
                Multisig
              </Chip>
            )}
            {(isPure || isProxied) && (
              <Chip color='default' className='bg-[#B700FF]/5 text-[#B700FF]' size='sm'>
                {isPure ? 'Pure' : 'Proxied'}
              </Chip>
            )}
          </div>
        </div>
      </div>
    ) : (
      <div className='bg-content1 rounded-medium border-primary/5 shadow-small relative w-[240px] overflow-hidden border-1 p-2.5'>
        <AddressCell
          value={data.account.address}
          withAddressBook={showAddressNodeOperations}
          withCopy={showAddressNodeOperations}
          icons={
            showAddressNodeOperations ? (
              <Button
                isIconOnly
                variant='light'
                color='default'
                size='sm'
                className='text-foreground/50 h-[18px] w-[18px] opacity-50'
                onPress={() => {
                  window.open(`${window.location.origin}?address=${data.account.address}&tab=structure`, '_blank');
                }}
              >
                <IconView />
              </Button>
            ) : undefined
          }
        />
      </div>
    );
  }

  return (
    <>
      {(data.account.type === 'multisig' || !!data.account.delegatees.length) && (
        <Handle
          isConnectable={isConnectable}
          position={Position.Left}
          style={{
            zIndex: 1,
            top: 29,
            width: 5,
            height: 18,
            left: 2.5,
            borderRadius: '10px',
            background:
              isPure || isProxied
                ? '#B700FF'
                : isMultisig
                  ? 'hsl(var(--heroui-primary))'
                  : 'hsl(var(--heroui-divider-300))'
          }}
          type='source'
        />
      )}
      {cell}
      {!data.isTop && (
        <Handle
          isConnectable={isConnectable}
          position={Position.Right}
          style={{
            zIndex: 1,
            top: 29,
            width: 5,
            height: 18,
            right: 2.5,
            borderRadius: '10px',
            background:
              data.type === 'proxy'
                ? '#B700FF'
                : data.type === 'multisig'
                  ? 'hsl(var(--heroui-primary))'
                  : 'hsl(var(--heroui-divider-300))'
          }}
          type='target'
        />
      )}
    </>
  );
});

export default React.memo(AddressNode);
