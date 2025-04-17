// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccount } from '@/accounts/useAccount';
import ArrowDown from '@/assets/svg/ArrowDown.svg?react';
import IconClose from '@/assets/svg/icon-close.svg?react';
import { Empty } from '@/components';
import { useBatchSync } from '@/hooks/useBatchSync';
import { CallDisplaySection } from '@/params';
import { useToggle } from 'react-use';

import { useApi } from '@mimir-wallet/polkadot-core';
import { Alert, Button, Divider, Spinner } from '@mimir-wallet/ui';

import BatchItem from './BatchItem';

function Restore({ onClose }: { onClose: () => void }) {
  const { network } = useApi();
  const { current } = useAccount();
  const [isOpen, toggleOpen] = useToggle(true);

  const [txs, restoreList, restore, isFetched, isFetching] = useBatchSync(network, current);

  return (
    <div className='min-h-full space-y-5'>
      <div className='flex items-center justify-between text-xl font-bold'>
        Restore Cache Transactions
        <Button isIconOnly color='default' variant='light' onPress={onClose}>
          <IconClose className='w-5 h-5' />
        </Button>
      </div>
      <Divider />

      <Alert
        className='flex-grow-0'
        color='warning'
        title='Your transactions will be delete after transactions been restore.'
      />

      {!isFetched && isFetching && <Spinner variant='dots' />}

      {isFetched && !txs?.length && <Empty label='No batch found' height='300px' />}

      {current && !!txs?.length && (
        <>
          <Alert className='flex-grow-0' color='success' title={`${txs.length} Transactions Founded`} />
          {txs?.map((item) => (
            <BatchItem key={item.id} from={current} calldata={item.call}>
              <div className='col-span-1 flex items-center'>{item.id}</div>
              <div className='col-span-2 flex items-center'>
                <CallDisplaySection section={item.section} method={item.method} />
              </div>
            </BatchItem>
          ))}

          <Button
            fullWidth
            onPress={() => {
              restore();
              onClose?.();
            }}
          >
            Restore
          </Button>
        </>
      )}

      {current && !!restoreList?.length && (
        <>
          <div onClick={toggleOpen} className='cursor-pointer flex items-center justify-between'>
            Restored
            <ArrowDown data-open={isOpen} className='w-5 h-5 data-[open=true]:rotate-180' />
          </div>

          {isOpen &&
            restoreList.map((item) => (
              <BatchItem
                key={item.id}
                from={current}
                calldata={item.call}
                bgcolor='linear-gradient(180deg, #F9F9FC 0%, #E5EBF9 100%)'
              >
                <div className='col-span-1 flex items-center'>{item.id}</div>
                <div className='col-span-2 flex items-center'>
                  <CallDisplaySection section={item.section} method={item.method} />
                </div>
              </BatchItem>
            ))}
        </>
      )}
    </div>
  );
}

export default Restore;
