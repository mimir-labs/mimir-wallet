// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

import { useAccount } from '@/accounts/useAccount';
import { Address } from '@/components';
import { toastError, toastSuccess } from '@/components/utils';
import { type NotificationMessage, notificationStore } from '@/hooks/useNotifications';
import { formatTransactionId } from '@/transactions';
import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';

import { addressToHex } from '@mimir-wallet/polkadot-core';
import { useSocket } from '@mimir-wallet/service';

const handler = (message: NotificationMessage) => {
  notificationStore.getState().put([message]);

  if (message.status === 'success' || message.status === 'failed') {
    (message.status === 'success' ? toastSuccess : toastError)(
      <div className='flex flex-col gap-1'>
        <div className='font-bold'>Transaction</div>
        <p className='text-xs'>
          Transaction {formatTransactionId(message.id)} Executed {message.status}
        </p>
        <Link className='text-primary text-xs active:underline' to='/transactions?status=history'>
          View Transaction{'>'}
        </Link>
      </div>
    );
  } else if (message.notificationType === 'transaction_created') {
    toastSuccess(
      <div className='flex flex-col gap-1'>
        <div className='font-bold'>Transaction</div>
        <p className='text-xs'>
          New Transaction by <Address shorten value={message.signer} />
        </p>
        <Link className='text-primary text-xs active:underline' to='/transactions?status=pending'>
          View Pending{'>'}
        </Link>
      </div>
    );
  } else {
    toastSuccess(
      <div className='flex flex-col gap-1'>
        <div className='font-bold'>Transaction</div>
        <p className='text-xs'>
          <Address shorten value={message.signer} /> approve Transaction {formatTransactionId(message.id)}
        </p>
        <Link className='text-primary text-xs active:underline' to='/transactions?status=pending'>
          View Pending{'>'}
        </Link>
      </div>
    );
  }
};

function SubscribeItem({ address }: { address: HexString }) {
  const { subscribe, ack, unsubscribe, isConnected, socket } = useSocket();

  useEffect(() => {
    if (isConnected) {
      subscribe(address);
      ack('getInitialData', address).then((data) => {
        notificationStore.getState().put(data);
      });

      return () => {
        unsubscribe(address);
      };
    }

    return () => {};
  }, [ack, address, isConnected, socket, subscribe, unsubscribe]);

  return null;
}

function SubscribeNotification() {
  const { isConnected, socket } = useSocket();
  const { accounts } = useAccount();

  const addresses = useMemo(() => accounts.map((item) => addressToHex(item.address)), [accounts]);

  useEffect(() => {
    if (isConnected) {
      socket?.on(`new-notification`, handler);

      return () => {
        socket?.off(`new-notification`, handler);
      };
    }

    return () => {};
  }, [isConnected, socket]);

  return addresses.map((address) => <SubscribeItem key={address} address={address} />);
}

export default SubscribeNotification;
