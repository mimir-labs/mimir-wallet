// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccount } from '@/accounts/useAccount';
import { useQueryAccount } from '@/accounts/useQueryAccount';
import ArrowDown from '@/assets/svg/ArrowDown.svg?react';
import { Empty } from '@/components';
import { toastError } from '@/components/utils';
import { walletConfig } from '@/config';
import { CONNECT_ORIGIN } from '@/constants';
import { useBatchSync } from '@/hooks/useBatchSync';
import { useProposersAndMembersFilter } from '@/hooks/useProposeFilter';
import { CallDisplaySection } from '@/params';
import { accountSource } from '@/wallet/useWallet';
import { useState } from 'react';
import { useToggle } from 'react-use';

import { useApi } from '@mimir-wallet/polkadot-core';
import { service } from '@mimir-wallet/service';
import { Alert, AlertTitle, Button, buttonSpinner, Checkbox, Spinner } from '@mimir-wallet/ui';

import BatchItem from './BatchItem';

function Restore({ onClose }: { onClose: () => void }) {
  const { network, api } = useApi();
  const { current } = useAccount();
  const [isOpen, toggleOpen] = useToggle(true);
  const [selected, setSelected] = useState<number[]>([]);

  const [txs, restoreList, restore, isFetched, isFetching, refetch] = useBatchSync(network, current);
  const isCheckAll = selected.length === txs.length;
  const isCheckSome = selected.length > 0 && selected.length < txs.length;
  const [account] = useQueryAccount(current);
  const filtered = useProposersAndMembersFilter(account);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (filtered.length === 0 || selected.length === 0 || !current) {
      return;
    }

    const signer = filtered[0];

    const source = accountSource(signer);

    if (!source) {
      toastError('No signer found');

      return;
    }

    const injected = await window.injectedWeb3?.[walletConfig[source]?.key || ''].enable(CONNECT_ORIGIN);
    const injectSigner = injected?.signer;

    if (!injectSigner) {
      toastError(`Please connect to the wallet: ${walletConfig[source]?.name || source}`);

      return;
    }

    if (!injectSigner.signRaw) {
      const walletName = walletConfig[source]?.name || source;

      toastError(`Wallet ${walletName} does not support message signing`);

      return;
    }

    try {
      setLoading(true);
      const time = new Date().toUTCString();
      const message = `Sign for remove mimir batch
IDs: ${selected}
Address: ${current}
Timestamp: ${time}`;

      const result = await injectSigner.signRaw({
        address: signer,
        data: message,
        type: 'bytes'
      });

      await service.transaction.removeBatch(network, current, selected, result.signature, signer, time);
      setSelected([]);
      refetch();
    } catch (error) {
      console.error('Failed to delete batch transactions:', error);
      toastError(error instanceof Error ? error.message : 'Failed to delete selected transactions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex h-full flex-1 flex-col gap-5 overflow-hidden'>
      {isFetched && !txs?.length && <Empty label='No batch found' height='300px' />}

      {!isFetched && isFetching && <Spinner variant='wave' />}

      <div className='scrollbar-hide flex-1 space-y-2.5 overflow-y-auto'>
        {current && !!txs?.length && (
          <>
            <Alert variant='success' className='flex-grow-0'>
              <AlertTitle>{txs.length} Transactions Founded</AlertTitle>
            </Alert>

            {txs?.map((item) => (
              <BatchItem key={item.id} from={current} calldata={item.call} registry={api.registry}>
                <div className='col-span-1 flex items-center'>
                  <Checkbox
                    size='sm'
                    isSelected={selected.includes(item.id)}
                    onValueChange={(state) => {
                      setSelected((values) => (state ? [...values, item.id] : values.filter((v) => item.id !== v)));
                    }}
                  >
                    {item.id}
                  </Checkbox>
                </div>
                <div className='col-span-2 flex items-center'>
                  <CallDisplaySection section={item.section} method={item.method} />
                </div>
              </BatchItem>
            ))}
          </>
        )}

        {current && !!restoreList?.length && (
          <>
            <div onClick={toggleOpen} className='flex cursor-pointer items-center justify-between'>
              Restored
              <ArrowDown data-open={isOpen} className='h-5 w-5 data-[open=true]:rotate-180' />
            </div>

            {isOpen &&
              restoreList.map((item) => (
                <BatchItem
                  key={item.id}
                  from={current}
                  calldata={item.call}
                  bgcolor='linear-gradient(180deg, #F9F9FC 0%, #E5EBF9 100%)'
                  registry={api.registry}
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

      <div className='flex gap-5'>
        <div className='flex flex-1 items-center pl-2'>
          <Checkbox
            size='sm'
            isSelected={isCheckAll || isCheckSome}
            isIndeterminate={isCheckSome}
            onValueChange={(checked) => {
              if (checked) {
                setSelected(txs.map((item) => item.id));
              } else {
                setSelected([]);
              }
            }}
          >
            All
          </Checkbox>
        </div>

        <Button
          disabled={loading || selected.length === 0 || filtered.length === 0 || !current}
          color='danger'
          variant='ghost'
          onClick={handleDelete}
        >
          {loading ? buttonSpinner : null}
          Delete
        </Button>

        <Button
          disabled={selected.length === 0}
          onClick={() => {
            restore(selected);
            onClose?.();
          }}
        >
          Restore
        </Button>
      </div>
    </div>
  );
}

export default Restore;
