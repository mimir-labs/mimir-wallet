// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Transaction } from '@/hooks/types';
import type { IMethod } from '@polkadot/types/types';

import IconTemplate from '@/assets/svg/icon-template.svg?react';
import { AppName, Bytes, Hash } from '@/components';
import { events } from '@/events';
import { useToggle } from '@/hooks/useToggle';
import { Box, Button, Divider, Stack, SvgIcon } from '@mui/material';
import moment from 'moment';
import React from 'react';

import { useApi } from '@mimir-wallet/polkadot-core';

import Target from './Target';

export function Item({ content, title }: { title?: React.ReactNode; content?: React.ReactNode }) {
  return (
    <div className='grid grid-cols-10 gap-2.5 w-full text-tiny'>
      <div className='flex col-span-2 items-center font-bold'>{title}</div>
      <div className='flex col-span-8 items-center font-bold text-foreground/65'>{content}</div>
    </div>
  );
}

function Extrinsic({
  defaultOpen,
  transaction,
  call
}: {
  defaultOpen?: boolean;
  transaction: Transaction;
  call?: IMethod | null;
}) {
  const { network } = useApi();
  const [isOpen, toggleOpen] = useToggle(defaultOpen);

  const txCallHex = transaction.call;

  return (
    <>
      <Stack flex='1' spacing={1}>
        <Target address={transaction.address} call={call} />

        <Divider />

        <Item
          title='App'
          content={
            <AppName website={transaction.website} appName={transaction.appName} iconUrl={transaction.iconUrl} />
          }
        />
        {transaction.createdExtrinsicHash && (
          <Item
            title='Created Extrinsic'
            content={<Hash value={transaction.createdExtrinsicHash} withCopy withExplorer />}
          />
        )}
        {transaction.executedExtrinsicHash && (
          <Item
            title='Executed Extrinsic'
            content={<Hash value={transaction.executedExtrinsicHash} withCopy withExplorer />}
          />
        )}

        <Box
          sx={{ fontWeight: 700, color: 'primary.main', cursor: 'pointer', textDecoration: 'none' }}
          onClick={toggleOpen}
        >
          {isOpen ? 'Hide' : 'View'} Details
        </Box>

        {isOpen && (
          <>
            <Item title='Call Hash' content={<Hash value={transaction.callHash} withCopy />} />
            {txCallHex && (
              <Item
                title='Call Data'
                content={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Bytes value={txCallHex} />
                    <Button
                      variant='outlined'
                      size='small'
                      endIcon={
                        <SvgIcon sx={{ fontSize: '0.75rem !important' }} inheritViewBox component={IconTemplate} />
                      }
                      sx={{ paddingX: 1, paddingY: 0.3, fontSize: '0.75rem' }}
                      onClick={() => events.emit('template_add', network, txCallHex)}
                    >
                      + Template
                    </Button>
                  </Box>
                }
              />
            )}
            {transaction.note && <Item title='Note' content={transaction.note} />}
            {transaction.createdBlock && <Item title='Created Block' content={transaction.createdBlock} />}
            <Item title='Created Time' content={moment(transaction.createdAt).format()} />
            {transaction.executedBlock && <Item title='Executed Block' content={transaction.executedBlock} />}
            {transaction.cancelBlock && <Item title='Cancel Block' content={transaction.cancelBlock} />}
            {transaction.cancelExtrinsicHash && (
              <Item
                title='Cancel Extrinsic'
                content={<Hash value={transaction.cancelExtrinsicHash} withCopy withExplorer />}
              />
            )}
          </>
        )}
      </Stack>
    </>
  );
}

export default React.memo(Extrinsic);
