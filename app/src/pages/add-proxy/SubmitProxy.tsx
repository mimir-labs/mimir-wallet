// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ProxyArgs } from './types';

import { Address, AddressRow, TxButton } from '@/components';
import { toastSuccess } from '@/components/utils';
import { useTxQueue } from '@/hooks/useTxQueue';
import React, { useCallback, useState } from 'react';
import { useAsyncFn, useToggle } from 'react-use';

import { useApi } from '@mimir-wallet/polkadot-core';
import {
  Button,
  Checkbox,
  Divider,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader
} from '@mimir-wallet/ui';

function ConfirmDialog({
  open,
  list,
  onClose,
  onSubmit
}: {
  open: boolean;
  list: string[];
  onClose: () => void;
  onSubmit: () => void;
}) {
  const [checked, toggleChecked] = useToggle(false);

  return (
    <Modal isOpen={open} onClose={onClose} size='2xl'>
      <ModalContent>
        <ModalHeader className='flex-col gap-4'>
          Safety Alert
          <p className='text-small'>
            We have detected that, because your proxy account also has its own proxy, the following accounts can
            indirectly control your account.
          </p>
        </ModalHeader>
        <Divider />
        <ModalBody className='gap-4'>
          <p>Indirect Controllers</p>
          {list.map((address) => (
            <div
              className='rounded-medium border-divider-300 flex items-center justify-between border-1 p-2.5'
              key={address}
            >
              <AddressRow withAddress={false} withName value={address} />
              <Address shorten value={address} />
            </div>
          ))}
        </ModalBody>
        <Divider />
        <ModalFooter>
          <div className='flex w-full flex-col gap-4'>
            <Checkbox size='sm' isSelected={checked} onValueChange={toggleChecked}>
              I Understand
            </Checkbox>

            <Button fullWidth color='primary' isDisabled={!checked} onPress={onSubmit}>
              Confirm
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

function SubmitProxy({
  proxied,
  proxyArgs,
  setProxyArgs
}: {
  proxied?: string;
  proxyArgs: ProxyArgs[];
  setProxyArgs: React.Dispatch<React.SetStateAction<ProxyArgs[]>>;
}) {
  const { api, network } = useApi();
  const [alertOpen, toggleAlertOpen] = useToggle(false);
  const { addQueue } = useTxQueue();
  const [detacted, setDetacted] = useState<string[]>([]);

  const handleSubmit = useCallback(() => {
    if (!(proxyArgs.length && proxied)) {
      return;
    }

    toggleAlertOpen(false);

    const call =
      proxyArgs.length > 1
        ? api.tx.utility.batchAll(
            proxyArgs.map((item) => api.tx.proxy.addProxy(item.delegate, item.proxyType as any, item.delay))
          ).method
        : api.tx.proxy.addProxy(proxyArgs[0].delegate, proxyArgs[0].proxyType as any, proxyArgs[0].delay).method;

    addQueue({
      call,
      accountId: proxied,
      website: 'mimir://internal/setup',
      network,
      onResults: (result) => {
        setProxyArgs([]);
        const events = result.events.filter((item) => api.events.proxy.ProxyAdded.is(item.event));

        if (events.length > 0) {
          toastSuccess(
            <div className='ml-4 flex flex-col gap-1'>
              <p>
                <b>Proxy Added</b>
              </p>
              <p className='text-tiny'>
                <Address value={proxied} shorten /> added {proxyArgs.length} new proxy
              </p>
              <Link
                className='text-tiny text-primary no-underline'
                href={`/?address=${proxied.toString()}&tab=structure`}
              >
                Account Structure{'>'}
              </Link>
            </div>
          );
        }
      }
    });
  }, [addQueue, api, network, proxied, proxyArgs, setProxyArgs, toggleAlertOpen]);

  const handleClickAction = useAsyncFn(async () => {
    const detacted: Set<string> = new Set();

    for (const { delegate } of proxyArgs) {
      const result = await api.query.proxy.proxies(delegate);

      for (const item of result[0]) {
        if (item.proxyType.type === 'Any' || (item.proxyType.type as string) === 'NonTransfer') {
          detacted.add(item.delegate.toString());
        }
      }
    }

    if (detacted.size > 0) {
      setDetacted(Array.from(detacted));
      toggleAlertOpen(true);
    } else {
      handleSubmit();
    }
  }, [api, handleSubmit, proxyArgs, toggleAlertOpen]);

  return (
    <>
      <TxButton
        fullWidth
        color='primary'
        isDisabled={!(proxyArgs.length && proxied)}
        accountId={proxied}
        overrideAction={handleClickAction[1]}
        isLoading={handleClickAction[0].loading}
      >
        Confirm
      </TxButton>

      <ConfirmDialog open={alertOpen} list={detacted} onClose={toggleAlertOpen} onSubmit={handleSubmit} />
    </>
  );
}

export default React.memo(SubmitProxy);
