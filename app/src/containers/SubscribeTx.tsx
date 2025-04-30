// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

import { Address } from '@/components';
import { toastError, toastSuccess } from '@/components/utils';
import { TransactionStatus, TransactionType } from '@/hooks/types';
import { subscribe, unsubscribe } from '@/socket';
import { formatTransactionId } from '@/transactions';
import { u8aToHex } from '@polkadot/util';
import { decodeAddress } from '@polkadot/util-crypto';
import { useEffect } from 'react';

import { Link } from '@mimir-wallet/ui';

type TxMessage = {
  id: number;
  address: HexString;
  type: TransactionType;
  section?: string | null;
  method?: string | null;
  genesisHash: HexString;
  isMimir: boolean;
  createdTimestamp: number;
  isNew: boolean;
  status: TransactionStatus;
  triggerAddress: HexString;
};

function SubscribeTx({ address }: { address: string }) {
  useEffect(() => {
    const topic = `tx:${u8aToHex(decodeAddress(address))}`;

    const handler = (message: TxMessage) => {
      if (message.status > TransactionStatus.Pending) {
        (message.status === TransactionStatus.Success ? toastSuccess : toastError)(
          <div className='ml-4 flex flex-col gap-1'>
            <div className='font-bold'>Transaction</div>
            <p className='text-tiny'>
              Transaction {formatTransactionId(message.id)} Executed {TransactionStatus[message.status]}
            </p>
            <Link color='primary' className='text-tiny' underline='active' href='/transactions?status=history'>
              View Transaction{'>'}
            </Link>
          </div>
        );
      } else if (message.isNew) {
        toastSuccess(
          <div className='ml-4 flex flex-col gap-1'>
            <div className='font-bold'>Transaction</div>
            <p className='text-tiny'>
              New Transaction by <Address shorten value={message.triggerAddress} />
            </p>
            <Link color='primary' className='text-tiny' underline='active' href='/transactions?status=pending'>
              View Pending{'>'}
            </Link>
          </div>
        );
      } else if (message.status === TransactionStatus.Pending) {
        if (message.type === TransactionType.Multisig) {
          toastSuccess(
            <div className='ml-4 flex flex-col gap-1'>
              <div className='font-bold'>Transaction</div>
              <p className='text-tiny'>
                <Address shorten value={message.triggerAddress} /> approve Transaction {formatTransactionId(message.id)}
              </p>
              <Link color='primary' className='text-tiny' underline='active' href='/transactions?status=pending'>
                View Pending{'>'}
              </Link>
            </div>
          );
        }
      }
    };

    const unsub = subscribe(topic, handler);

    return () => {
      unsub();
      unsubscribe(topic);
    };
  }, [address]);

  return null;
}

export default SubscribeTx;
