// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

import { Address } from '@/components';
import { toastError, toastSuccess } from '@/components/utils';
import { TransactionStatus, TransactionType } from '@/hooks/types';
import { subscribe, unsubscribe } from '@/socket';
import { formatTransactionId } from '@/transactions';
import { Box, Typography } from '@mui/material';
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
          <Box marginLeft={1.5} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography fontWeight={700}>Transaction</Typography>
            <Typography fontSize={12}>
              Transaction {formatTransactionId(message.id)} Executed {TransactionStatus[message.status]}
            </Typography>
            <Link color='primary' className='text-tiny' underline='active' href='/transactions?status=history'>
              View Transaction{'>'}
            </Link>
          </Box>
        );
      } else if (message.isNew) {
        toastSuccess(
          <Box marginLeft={1.5} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography fontWeight={700}>Transaction</Typography>
            <Typography fontSize={12}>
              New Transaction by <Address shorten value={message.triggerAddress} />
            </Typography>
            <Link color='primary' className='text-tiny' underline='active' href='/transactions?status=pending'>
              View Pending{'>'}
            </Link>
          </Box>
        );
      } else if (message.status === TransactionStatus.Pending) {
        if (message.type === TransactionType.Multisig) {
          toastSuccess(
            <Box marginLeft={1.5} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography fontWeight={700}>Transaction</Typography>
              <Typography fontSize={12}>
                <Address shorten value={message.triggerAddress} /> approve Transaction {formatTransactionId(message.id)}
              </Typography>
              <Link color='primary' className='text-tiny' underline='active' href='/transactions?status=pending'>
                View Pending{'>'}
              </Link>
            </Box>
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
