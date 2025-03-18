// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { u128, Vec } from '@polkadot/types';
import type { PalletProxyProxyDefinition } from '@polkadot/types/lookup';
import type { ITuple } from '@polkadot/types/types';
import type { ProxyArgs } from './types';

import { useAccount } from '@/accounts/useAccount';
import IconArrow from '@/assets/svg/icon-arrow.svg?react';
import { Input, InputAddress } from '@/components';
import { ONE_DAY, ONE_HOUR } from '@/constants';
import { useBlockInterval } from '@/hooks/useBlockInterval';
import { useCall } from '@/hooks/useCall';
import { useInput } from '@/hooks/useInput';
import { useProxyTypes } from '@/hooks/useProxyTypes';
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
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToggle } from 'react-use';

import { addressEq, useApi } from '@mimir-wallet/polkadot-core';
import { Alert } from '@mimir-wallet/ui';

import AddProxy from './AddProxy';
import ProxyInfo from './ProxyInfo';
import PureCell from './PureCell';
import SubmitProxy from './SubmitProxy';
import SubmitPure from './SubmitPure';

function PageAddProxy({ pure }: { pure?: boolean }) {
  const { api } = useApi();
  const navigate = useNavigate();
  const { accounts, current } = useAccount();
  const proxyTypes = useProxyTypes();
  const [proxyType, setProxyType] = useState<string>(proxyTypes?.[0]?.text || 'Any');
  const [proxied, setProxied] = useState<string | undefined>(current);
  const [proxy, setProxy] = useState<string | undefined>(pure ? current : accounts[0]?.address);
  const [name, setName] = useInput('');
  const [advanced, toggleAdvanced] = useToggle(false);
  const [reviewWindow, setReviewWindow] = useState<number>(0);
  const [custom, setCustom] = useState<string>('');
  const blockInterval = useBlockInterval().toNumber();
  const [proxyArgs, setProxyArgs] = useState<ProxyArgs[]>([]);
  const proxies = useCall<ITuple<[Vec<PalletProxyProxyDefinition>, u128]>>(pure ? undefined : api.query.proxy.proxies, [
    proxied
  ]);

  const swap = useCallback(() => {
    setProxied(proxy);
    setProxy(proxied);
  }, [proxied, proxy]);

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

  useEffect(() => {
    if (!pure && addressEq(proxied, proxy)) {
      setProxy(undefined);
    }
  }, [proxied, proxy, pure]);

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

  return (
    <>
      <Box sx={{ width: 500, maxWidth: '100%', margin: '0 auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Button onClick={() => navigate(-1)} size='small' variant='outlined'>
            {'<'} Back
          </Button>
        </Box>
        <Paper sx={{ padding: { sm: 2, xs: 1.5 }, borderRadius: 2, marginTop: 1 }}>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant='h3'>{pure ? 'Create New Pure Proxy' : 'Add Proxy'}</Typography>
            </Box>
            <Divider />
            <Box
              sx={{
                display: 'flex',
                flexDirection: { sm: 'row', xs: 'column' },
                gap: 1,
                alignItems: { sm: 'start', xs: 'center' }
              }}
            >
              {pure ? (
                <PureCell />
              ) : (
                <InputAddress
                  shorten
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
                sx={{ cursor: 'pointer', transform: { sm: 'translateY(48px)', xs: 'rotate(90deg)' } }}
                onClick={pure ? undefined : swap}
              />
              <InputAddress
                excluded={!pure && proxied ? [proxied] : []}
                shorten
                value={proxy}
                onChange={setProxy}
                label='Proxy Account'
              />
            </Box>

            {pure && <Input label='Name' value={name} onChange={setName} />}

            <FormControl fullWidth>
              <InputLabel>Authorize</InputLabel>
              <Select<string> variant='outlined' onChange={(e) => setProxyType(e.target.value)} value={proxyType}>
                {proxyTypes.map(({ text }) => (
                  <MenuItem value={text} key={text}>
                    <Box sx={{ display: 'flex' }}>{text}</Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography fontWeight={700}>Advanced Setting</Typography>
              <Switch
                checked={advanced}
                onChange={(e) => {
                  toggleAdvanced(e.target.checked);
                  setReviewWindow(0);
                }}
              />
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

            {pure && proxyType !== 'Any' && (
              <Alert
                color='warning'
                title='You have selected a Pure Proxy with non-ANY permissions, which means that the assets in this account
                  cannot be moved, and you will not be able to add or remove new proxies. Please ensure the security of
                  your assets.'
              />
            )}

            {!pure && (
              <AddProxy
                proxied={proxied}
                proxy={proxy}
                proxyArgs={proxyArgs}
                reviewWindow={reviewWindow}
                custom={custom}
                proxyType={proxyType}
                setProxyArgs={setProxyArgs}
              />
            )}

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

            {!!(proxyArgs.length + (existsProxies.length || 0)) && <Divider />}

            <Alert
              color='warning'
              classNames={{
                base: 'items-start'
              }}
              title={
                <ul className='leading-[20px]'>
                  <li>A deposit is required for proxy creation.</li>
                  <li>Only accounts with full authority (ANY) can delete a proxy.</li>
                </ul>
              }
            />

            {pure ? (
              <SubmitPure proxy={proxy} name={name} reviewWindow={reviewWindow} custom={custom} proxyType={proxyType} />
            ) : (
              <SubmitProxy proxied={proxied} proxyArgs={proxyArgs} setProxyArgs={setProxyArgs} />
            )}

            {!pure && (
              <Box sx={{ filter: 'grayscale(30%)' }}>
                <Typography marginBottom={1} fontWeight={700} color='textSecondary'>
                  Existing Proxy
                </Typography>

                {existsProxies.map((proxy, index) => (
                  <ProxyInfo
                    key={`proxy_${index}`}
                    proxied={proxy.proxied}
                    delegate={proxy.delegate}
                    delay={proxy.delay}
                    proxyType={proxy.proxyType}
                  />
                ))}
              </Box>
            )}
          </Stack>
        </Paper>
      </Box>
    </>
  );
}

export default PageAddProxy;
