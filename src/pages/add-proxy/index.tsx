// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { u128, Vec } from '@polkadot/types';
import type { PalletProxyProxyDefinition } from '@polkadot/types/lookup';
import type { ITuple } from '@polkadot/types/types';
import type { ProxyArgs } from './types';

import {
  Alert,
  AlertTitle,
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
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import IconArrow from '@mimir-wallet/assets/svg/icon-arrow.svg?react';
import { Input, InputAddress } from '@mimir-wallet/components';
import { ONE_DAY, ONE_HOUR } from '@mimir-wallet/constants';
import { useAccount, useApi, useBlockInterval, useCall, useInput, useProxyTypes, useToggle } from '@mimir-wallet/hooks';
import { addressEq } from '@mimir-wallet/utils';

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

  useEffect(() => {
    if (addressEq(proxied, proxy)) {
      setProxy(undefined);
    }
  }, [proxied, proxy]);

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
        <Paper sx={{ padding: 2, borderRadius: 2, marginTop: 1 }}>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant='h3'>{pure ? 'Create New Pure Proxy' : 'Add Proxy'}</Typography>
            </Box>
            <Divider />
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
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
                sx={{ transform: 'translateY(14px)' }}
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

            {pure && proxyType !== 'Any' && (
              <Alert severity='warning'>
                <AlertTitle>
                  You have selected a Pure Proxy with non-ANY permissions, which means that the assets in this account
                  cannot be moved, and you will not be able to add or remove new proxies. Please ensure the security of
                  your assets.
                </AlertTitle>
              </Alert>
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

            <Alert severity='warning' sx={{ '.MuiAlert-message': { overflow: 'visible' } }}>
              <AlertTitle>Notice</AlertTitle>
              <ul>
                <li>Proxy account can have selected authority of proxied account.</li>
                <li>A deposit is necessary for proxy creation.</li>
                <li>Only All authority can delete proxy.</li>
              </ul>
            </Alert>

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
