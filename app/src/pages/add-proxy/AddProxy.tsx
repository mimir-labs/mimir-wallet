// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountData } from '@/hooks/types';
import type { u128, Vec } from '@polkadot/types';
import type { PalletProxyProxyDefinition } from '@polkadot/types/lookup';
import type { ITuple } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';
import type { ProxyArgs } from './types';

import { useAccount } from '@/accounts/useAccount';
import IconArrow from '@/assets/svg/icon-arrow.svg?react';
import { Input, InputAddress, InputNetwork } from '@/components';
import { ONE_DAY, ONE_HOUR } from '@/constants';
import { useBlockInterval } from '@/hooks/useBlockInterval';
import { useCall } from '@/hooks/useCall';
import { useInput } from '@/hooks/useInput';
import { useProxyTypes } from '@/hooks/useProxyTypes';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToggle } from 'react-use';

import { addressEq, useApi } from '@mimir-wallet/polkadot-core';
import { Alert, Button, Divider, Select, SelectItem, Switch } from '@mimir-wallet/ui';

import AddProxyButton from './AddProxyButton';
import ProxyInfo from './ProxyInfo';
import PureCell from './PureCell';
import SubmitProxy from './SubmitProxy';
import SubmitPure from './SubmitPure';

function filterAddresses(accounts: AccountData[], genesisHash: HexString) {
  return accounts
    .filter((account) => (account.type === 'pure' ? account.network === genesisHash : true))
    .map((item) => item.address);
}

function AddProxy({
  pure,
  network,
  proxied,
  setNetwork,
  setProxied
}: {
  pure?: boolean;
  network: string;
  proxied: string | undefined;
  setNetwork: (network: string) => void;
  setProxied: (proxied: string | undefined) => void;
}) {
  const { api, genesisHash } = useApi();
  const navigate = useNavigate();
  const { accounts, addresses, current } = useAccount();

  // filter accounts by network
  const [, filteredProxy] = useMemo(() => {
    const filteredProxied = filterAddresses(accounts, genesisHash);
    const filteredProxy = filteredProxied.concat(addresses.map((item) => item.address));

    return [filteredProxied, filteredProxy];
  }, [accounts, addresses, genesisHash]);
  const proxyTypes = useProxyTypes();
  const [proxyType, setProxyType] = useState<string>(proxyTypes?.[0]?.text || 'Any');
  const [name, setName] = useInput('');
  const [advanced, toggleAdvanced] = useToggle(false);
  const [reviewWindow, setReviewWindow] = useState<number>(0);
  const [custom, setCustom] = useState<string>('');
  const blockInterval = useBlockInterval().toNumber();
  const [proxyArgs, setProxyArgs] = useState<ProxyArgs[]>([]);
  const [proxy, setProxy] = useState<string | undefined>(pure ? current : filteredProxy[0]);
  const proxies = useCall<ITuple<[Vec<PalletProxyProxyDefinition>, u128]>>(pure ? undefined : api.query.proxy.proxies, [
    proxied
  ]);

  const swap = useCallback(() => {
    setProxied(proxy);
    setProxy(proxied);
  }, [proxied, proxy, setProxied]);

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
      <div className='w-[500px] max-w-full mx-auto my-0'>
        <div className='flex items-center justify-between'>
          <Button onPress={() => navigate(-1)} variant='ghost'>
            {'<'} Back
          </Button>
        </div>
        <div className='p-4 sm:p-5 rounded-large mt-2.5 bg-content1 shadow-medium'>
          <div className='space-y-5'>
            <div className='flex justify-between'>
              <h3>{pure ? 'Create New Pure Proxy' : 'Add Proxy'}</h3>
            </div>
            <Divider />

            <div className='flex flex-col sm:flex-row gap-2.5 items-center sm:items-start'>
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
              <IconArrow
                className='w-4 h-4 text-primary cursor-pointer rotate-90 sm translate-y-[48px]'
                onClick={pure ? undefined : swap}
              />
              <InputAddress
                excluded={!pure && proxied ? [proxied] : []}
                shorten
                value={proxy}
                onChange={setProxy}
                label='Proxy Account'
                filtered={filteredProxy}
              />
            </div>

            <InputNetwork label='Select Network' network={network} setNetwork={setNetwork} />

            {pure && <Input label='Name' value={name} onChange={setName} />}

            <div className='flex'>
              <Select
                label='Authorize'
                placeholder='Authorize'
                variant='bordered'
                labelPlacement='outside'
                selectionMode='single'
                selectedKeys={[proxyType]}
                onSelectionChange={(e) => {
                  if (e.currentKey) {
                    setProxyType(e.currentKey.toString());
                  }
                }}
              >
                {proxyTypes.map(({ text }) => (
                  <SelectItem textValue={text} key={text}>
                    {text}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <div className='flex items-center justify-between'>
              <div className='font-bold'>Advanced Setting</div>
              <Switch
                isSelected={advanced}
                onValueChange={(checked) => {
                  toggleAdvanced(checked);
                  setReviewWindow(0);
                }}
              />
            </div>

            {advanced && (
              <>
                <div className='flex'>
                  <Select
                    label='Review Window'
                    labelPlacement='outside'
                    placeholder='Review Window'
                    variant='bordered'
                    selectionMode='single'
                    selectedKeys={[reviewWindow.toString()]}
                    onSelectionChange={(e) => {
                      if (e.currentKey) {
                        setReviewWindow(Number(e.currentKey.toString()));
                      }
                    }}
                  >
                    {Object.entries(reviewWindows).map(([key, text]) => (
                      <SelectItem key={key}>{text}</SelectItem>
                    ))}
                  </Select>
                </div>

                {reviewWindow === -1 && (
                  <Input
                    label='Custom'
                    value={custom}
                    onChange={setCustom}
                    endAdornment={<p className='text-foreground text-nowrap'>Blocks (≈ {estimateCustom})</p>}
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
              <AddProxyButton
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
              <div style={{ filter: 'grayscale(30%)' }}>
                <p className='mb-2.5 font-bold text-foreground/65'>Existing Proxy</p>

                {existsProxies.map((proxy, index) => (
                  <ProxyInfo
                    key={`proxy_${index}`}
                    proxied={proxy.proxied}
                    delegate={proxy.delegate}
                    delay={proxy.delay}
                    proxyType={proxy.proxyType}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default AddProxy;
