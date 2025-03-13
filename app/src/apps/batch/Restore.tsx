// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccount } from '@/accounts/useAccount';
import IconClose from '@/assets/svg/icon-close.svg?react';
import { Empty } from '@/components';
import { useApi } from '@/hooks/useApi';
import { useBatchSync } from '@/hooks/useBatchSync';
import { CallDisplaySection } from '@/params';

import { Alert, Button, Divider, Spinner } from '@mimir-wallet/ui';

import BatchItem from './BatchItem';

function Restore({ onClose }: { onClose: () => void }) {
  const { network } = useApi();
  const { current } = useAccount();

  const [txs, restore, isFetched, isFetching] = useBatchSync(network, current);

  return (
    <div className='flex flex-col gap-5 h-full'>
      <div className='flex items-center justify-between text-xl font-bold'>
        Restore Cache Transactions
        <Button isIconOnly color='default' variant='light' onPress={onClose}>
          <IconClose className='w-5 h-5' />
        </Button>
        {/* <Button color='primary' variant='outlined' onClick={toggleOpen}>
        Add New
      </Button> */}
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
        </>
      )}

      {!!txs?.length && (
        <>
          <Divider />

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
    </div>
  );
}

export default Restore;
