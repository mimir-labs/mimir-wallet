// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ProxyArgs } from './types';

import { LoadingButton } from '@mui/lab';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Typography
} from '@mui/material';
import React, { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAsyncFn, useToggle } from 'react-use';

import { Address, AddressRow, toastSuccess } from '@mimir-wallet/components';
import { useApi, useTxQueue } from '@mimir-wallet/hooks';

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
    <Dialog open={open} onClose={onClose} maxWidth='sm'>
      <DialogTitle>
        Safety Alert
        <Typography marginTop={1.5}>
          We have detected that, because your proxy account also has its own proxy, the following accounts can
          indirectly control your account.
        </Typography>
      </DialogTitle>
      <Stack component={DialogContent} spacing={1.5}>
        <Typography>Indirect Controllers</Typography>
        {list.map((address) => (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 1,
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'grey.300'
            }}
            key={address}
          >
            <AddressRow withAddress={false} withName value={address} />
            <Address shorten value={address} />
          </Box>
        ))}
      </Stack>
      <DialogActions>
        <Stack spacing={1.5} width='100%'>
          <FormControlLabel control={<Checkbox checked={checked} onChange={toggleChecked} />} label='I Understand' />

          <Button fullWidth disabled={!checked} onClick={onSubmit}>
            Confirm
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
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
  const { api } = useApi();
  const [alertOpen, toggleAlertOpen] = useToggle(false);
  const { addQueue } = useTxQueue();
  const [detacted, setDetacted] = useState<string[]>([]);

  const handleSubmit = useCallback(() => {
    if (!proxyArgs.length || !proxied) {
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
      onResults: (result) => {
        setProxyArgs([]);
        const events = result.events.filter((item) => api.events.proxy.ProxyAdded.is(item.event));

        if (events.length > 0) {
          toastSuccess(
            <Box marginLeft={1.5} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography fontWeight={700}>Proxy Added</Typography>
              <Typography fontSize={12}>
                <Address value={proxied} shorten /> added {proxyArgs.length} new proxy
              </Typography>
              <Typography
                component={Link}
                fontSize={12}
                to={`/?address=${proxied.toString()}&tab=structure`}
                sx={{ color: 'primary.main', textDecoration: 'none' }}
              >
                Account Structure{'>'}
              </Typography>
            </Box>
          );
        }
      }
    });
  }, [addQueue, api, proxied, proxyArgs, setProxyArgs, toggleAlertOpen]);

  const handleClickAction = useAsyncFn(async () => {
    const detacted: Set<string> = new Set();

    for (const { delegate } of proxyArgs) {
      const result = await api.query.proxy.proxies(delegate);

      for (const item of result[0]) {
        if (item.proxyType.type === 'Any' || item.proxyType.type === 'NonTransfer') {
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
      <LoadingButton
        fullWidth
        disabled={!proxyArgs.length || !proxied}
        onClick={handleClickAction[1]}
        loading={handleClickAction[0].loading}
      >
        Submit
      </LoadingButton>

      <ConfirmDialog open={alertOpen} list={detacted} onClose={toggleAlertOpen} onSubmit={handleSubmit} />
    </>
  );
}

export default React.memo(SubmitProxy);
