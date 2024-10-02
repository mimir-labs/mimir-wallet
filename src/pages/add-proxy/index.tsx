// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { u128, Vec } from '@polkadot/types';
import type { PalletProxyProxyDefinition } from '@polkadot/types/lookup';
import type { ITuple } from '@polkadot/types/types';
import type { ProxyArgs } from './types';

import { LoadingButton } from '@mui/lab';
import {
  Box,
  Button,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  SvgIcon,
  Switch,
  Typography
} from '@mui/material';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAsyncFn } from 'react-use';

import IconArrow from '@mimir-wallet/assets/svg/icon-arrow.svg?react';
import { Input, InputAddress, toastWarn } from '@mimir-wallet/components';
import { ONE_DAY, ONE_HOUR } from '@mimir-wallet/constants';
import {
  useAccount,
  useApi,
  useBlockInterval,
  useCall,
  useProxyTypes,
  useToggle,
  useTxQueue
} from '@mimir-wallet/hooks';

import ProxyInfo from './ProxyInfo';
import PureCell from './PureCell';

function PageAddProxy({ pure }: { pure?: boolean }) {
  const { api } = useApi();
  const navigate = useNavigate();
  const { addQueue } = useTxQueue();
  const { accounts, current } = useAccount();
  const proxyTypes = useProxyTypes();
  const [proxyType, setProxyType] = useState<string>(proxyTypes.defKeys[0]);
  const [proxied, setProxied] = useState<string | undefined>(current);
  const [proxy, setProxy] = useState<string | undefined>(pure ? current : accounts[0]?.address);
  const [advanced, toggleAdvanced] = useToggle();
  const [reviewWindow, setReviewWindow] = useState<number>(0);
  const [custom, setCustom] = useState<string>('');
  const blockInterval = useBlockInterval().toNumber();
  const [proxyArgs, setProxyArgs] = useState<ProxyArgs[]>([]);
  const proxies = useCall<ITuple<[Vec<PalletProxyProxyDefinition>, u128]>>(pure ? undefined : api.query.proxy.proxies, [
    proxied
  ]);

  const existsProxies = useMemo(
    () =>
      proxies?.[0].map((proxy) => ({
        proxied,
        delegate: proxy.delegate.toString(),
        delay: proxy.delay.toNumber(),
        proxyType: proxy.proxyType.toString()
      })) || [],
    [proxied, proxies]
  );

  const estimateCustom =
    Number(custom) * blockInterval > ONE_DAY * 1000
      ? `${((Number(custom) * blockInterval) / (ONE_DAY * 1000)).toFixed(2)} Days`
      : `${((Number(custom) * blockInterval) / (ONE_HOUR * 1000)).toFixed(2)} Hours`;

  const reviewWindows = {
    0: 'None',
    [(ONE_DAY * 1000) / blockInterval]: '1 Day',
    [(ONE_DAY * 7 * 1000) / blockInterval]: '1 Week',
    [-1]: 'Custom'
  };

  const [state, onAdd] = useAsyncFn(async () => {
    if (!proxy || !proxied) {
      return;
    }

    const delay = reviewWindow === -1 ? Number(custom) : reviewWindow;

    if (proxyArgs.find((item) => item.delegate === proxy)) {
      toastWarn('Already added');

      return;
    }

    if (!pure) {
      const result = await api.query.proxy.proxies(proxied);

      if (result[0].find((item) => item.delegate.toString() === proxy)) {
        toastWarn('Already added');

        return;
      }
    }

    setProxyArgs([...proxyArgs, { delegate: proxy, proxyType, delay }]);
  }, [api.query.proxy, custom, proxied, proxy, proxyArgs, proxyType, pure, reviewWindow]);

  return (
    <>
      <Box sx={{ width: 500, maxWidth: '100%', margin: '0 auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Button onClick={() => navigate(-1)} size='small' variant='outlined'>
            {'<'} Back
          </Button>
        </Box>
        <Paper sx={{ padding: 2, borderRadius: 2, marginTop: 1 }}>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant='h3'>Add Proxy</Typography>
            </Box>
            <Divider />
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              {pure ? (
                <PureCell />
              ) : (
                <InputAddress
                  disabled={!!proxyArgs.length}
                  value={proxied}
                  onChange={setProxied}
                  label='Proxied Account'
                  isSign={!!pure}
                />
              )}
              <SvgIcon
                component={IconArrow}
                fontSize='small'
                inheritViewBox
                color='primary'
                sx={{ transform: 'translateY(14px)' }}
              />
              <InputAddress value={proxy} onChange={setProxy} label='Proxy Account' />
            </Box>

            <FormControl fullWidth>
              <InputLabel>Authorize</InputLabel>
              <Select<string> variant='outlined' onChange={(e) => setProxyType(e.target.value)} value={proxyType}>
                {proxyTypes.defKeys.map((key) => (
                  <MenuItem value={key} key={key}>
                    <Box sx={{ display: 'flex' }}>{key}</Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography fontWeight={700}>Advanced Setting</Typography>
              <Switch checked={advanced} onChange={toggleAdvanced} />
            </Box>

            {advanced && (
              <>
                <FormControl fullWidth>
                  <InputLabel>Review Window</InputLabel>
                  <Select<string>
                    variant='outlined'
                    onChange={(e) => setReviewWindow(Number(e.target.value))}
                    value={reviewWindow.toString()}
                  >
                    {Object.entries(reviewWindows).map(([key, text]) => (
                      <MenuItem value={key} key={key}>
                        {text}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {reviewWindow === -1 && (
                  <Input
                    label='Custom'
                    value={custom}
                    onChange={setCustom}
                    endAdornment={<Typography color='textPrimary'>Blocks (≈ {estimateCustom})</Typography>}
                  />
                )}
              </>
            )}

            {!pure && (
              <LoadingButton
                disabled={!proxied || !proxy}
                fullWidth
                variant='outlined'
                onClick={onAdd}
                loading={state.loading}
              >
                Add
              </LoadingButton>
            )}

            {!!(proxyArgs.length + (existsProxies.length || 0)) && <Divider />}

            {!pure &&
              existsProxies.map((proxy, index) => (
                <ProxyInfo
                  key={`proxy_${index}`}
                  proxied={proxy.proxied}
                  delegate={proxy.delegate}
                  delay={proxy.delay}
                  proxyType={proxy.proxyType}
                />
              ))}

            {!pure &&
              proxyArgs.map((arg, index) => (
                <ProxyInfo
                  key={index}
                  proxied={proxied}
                  delegate={arg.delegate}
                  delay={arg.delay}
                  proxyType={arg.proxyType}
                  onDelete={() => {
                    setProxyArgs((args) => args.filter((_, i) => index !== i));
                  }}
                />
              ))}

            <Button
              fullWidth
              disabled={pure ? !proxy : !proxyArgs.length || !proxied}
              onClick={() => {
                if (pure) {
                  if (!proxy) {
                    return;
                  }

                  const delay = reviewWindow === -1 ? Number(custom) : reviewWindow;

                  addQueue({
                    call: api.tx.proxy.createPure(proxyType as any, delay, 0).method,
                    accountId: proxy,
                    website: 'mimir://internal/create-pure'
                  });

                  return;
                }

                if (!proxyArgs.length || !proxied) {
                  return;
                }

                if (proxyArgs.length > 1) {
                  addQueue({
                    call: api.tx.utility.batchAll(
                      proxyArgs.map((item) => api.tx.proxy.addProxy(item.delegate, item.proxyType as any, item.delay))
                    ).method,
                    accountId: proxied,
                    website: 'mimir://internal/setup'
                  });
                } else
                  addQueue({
                    call: api.tx.proxy.addProxy(
                      proxyArgs[0].delegate,
                      proxyArgs[0].proxyType as any,
                      proxyArgs[0].delay
                    ).method,
                    accountId: proxied,
                    website: 'mimir://internal/setup'
                  });
              }}
            >
              Submit
            </Button>
          </Stack>
        </Paper>
      </Box>
    </>
  );
}

export default PageAddProxy;
