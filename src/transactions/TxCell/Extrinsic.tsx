// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ReactComponent as IconLink } from '@mimir-wallet/assets/svg/icon-link.svg';
import { AddressRow, Hex } from '@mimir-wallet/components';
import { useApi, useDapp, useSelectedAccountCallback, useToggle } from '@mimir-wallet/hooks';
import { Transaction } from '@mimir-wallet/hooks/types';
import { Call } from '@mimir-wallet/params';
import FallbackCall from '@mimir-wallet/params/FallbackCall';
import { Box, Dialog, DialogContent, DialogTitle, Divider, Stack, SvgIcon } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';

function Item({ content, name }: { name: React.ReactNode; content: React.ReactNode }) {
  return (
    <Stack alignItems='center' direction='row'>
      <Box sx={{ width: '30%', maxWidth: 130, fontWeight: 700, textTransform: 'capitalize' }}>{name}</Box>
      <Box sx={{ width: '70%', flex: '1 0 auto', color: 'text.secondary' }}>{content}</Box>
    </Stack>
  );
}

function Extrinsic({ transaction }: { transaction: Transaction }) {
  const destTx = transaction.top;
  const { api } = useApi();
  const selectAccount = useSelectedAccountCallback();
  const dapp = useDapp(transaction.initTransaction.website);
  const [open, toggleOpen] = useToggle();

  return (
    <>
      <Dialog onClose={toggleOpen} open={open}>
        <DialogTitle>Call Detail</DialogTitle>
        <DialogContent>{open && <FallbackCall call={destTx.call} />}</DialogContent>
      </Dialog>
      <Stack flex='1' spacing={1}>
        <Stack spacing={1} sx={{ lineHeight: 1.5 }}>
          <Item
            content={
              <AddressRow
                defaultName={destTx.sender}
                isMe={destTx === transaction}
                onClick={(value) => value && selectAccount(value)}
                shorten={false}
                size='small'
                value={destTx.sender}
                withAddress={false}
                withCopy
                withName
              />
            }
            name='From'
          />
          <Call
            api={api}
            call={destTx.call}
            jsonFallback={false}
            selectAccount={destTx.action === 'multisig.cancelAsMulti' ? selectAccount : undefined}
            tx={destTx.action === 'multisig.cancelAsMulti' ? destTx : undefined}
            type='tx'
          />
          <Divider />
          {dapp && (
            <Item
              content={
                <Box component={Link} sx={{ textDecoration: 'none', color: 'text.primary', display: 'flex', alignItems: 'center', gap: 0.5 }} to={`/explorer/${encodeURIComponent(dapp.url)}`}>
                  <Box component='img' src={dapp.icon} width={20} />
                  {dapp.name}
                  <SvgIcon component={IconLink} fontSize='small' inheritViewBox />
                </Box>
              }
              name='App'
            />
          )}
          <Item content={<AddressRow shorten size='small' value={transaction.initTransaction.sender} withAddress withCopy withName />} name='Initiator' />
          <Item content={<Hex value={destTx.call.hash.toHex()} withCopy />} name='Call Hash' />
          <Item content={<Hex value={destTx.call.hash.toHex()} withCopy />} name='Call Data' />
          <Box onClick={toggleOpen} sx={{ fontWeight: 600, color: 'primary.main', cursor: 'pointer', textDecoration: 'none' }}>
            View Parameters
          </Box>
        </Stack>
      </Stack>
    </>
  );
}

export default React.memo(Extrinsic);
