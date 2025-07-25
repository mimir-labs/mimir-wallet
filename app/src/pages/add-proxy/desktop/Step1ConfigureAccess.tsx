// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccount } from '@/accounts/useAccount';
import PureIcon from '@/assets/images/pure-icon.svg';
import { AddressName, EditableField, InputAddress, InputNetwork, ProxyControls } from '@/components';
import { useEffect } from 'react';

import { addressEq, useApi } from '@mimir-wallet/polkadot-core';
import { Button, Divider, Switch } from '@mimir-wallet/ui';

import Tips from '../components/Tips';
import { useProxyValidation } from '../hooks/useProxyValidation';

interface Step1ConfigureAccessProps {
  network: string;
  setNetwork: (network: string) => void;
  proxied: string | undefined;
  proxy: string | undefined;
  isPureProxy: boolean;
  pureProxyName?: string;
  onNext: () => void;
  onDataChange: (updates: {
    proxied?: string | undefined;
    proxy?: string | undefined;
    isPureProxy?: boolean;
    pureProxyName?: string;
  }) => void;
}

function Step1ConfigureAccess({
  network,
  setNetwork,
  proxied,
  proxy,
  isPureProxy,
  pureProxyName,
  onNext,
  onDataChange
}: Step1ConfigureAccessProps) {
  const { current } = useAccount();
  const { genesisHash } = useApi();

  // Use validation hook for account filtering and validation
  const validationResult = useProxyValidation(
    {
      proxied,
      proxy,
      isPureProxy,
      proxyType: 'Any', // Default value for validation
      hasDelay: false,
      delayType: 'hour',
      customBlocks: '0'
    },
    genesisHash
  );

  useEffect(() => {
    if (!isPureProxy && addressEq(proxied, proxy)) {
      onDataChange({ proxy: undefined });
    }
  }, [proxied, proxy, isPureProxy, onDataChange]);

  return (
    <div className='flex flex-col gap-4'>
      {/* Network Selection */}
      <InputNetwork label='Select network' network={network} setNetwork={setNetwork} />

      {/* Configure Proxy Access */}
      <div className='flex flex-col gap-1'>
        <label className='text-foreground text-sm font-bold'>Configure Proxy Access</label>
        <div className='relative flex flex-col items-center gap-[5px]'>
          {/* Proxy Account (Upper) */}
          <InputAddress
            excluded={!isPureProxy && proxied ? [proxied] : []}
            shorten={false}
            value={proxy}
            onChange={(value) => onDataChange({ proxy: value })}
            placeholder='Select proxy account'
            filtered={validationResult.filteredProxyAddresses}
          />

          <ProxyControls className='!absolute inset-x-auto inset-y-0 z-10 m-auto' />

          {/* Proxied Account (Lower) */}
          {isPureProxy ? (
            <div className='bg-secondary rounded-medium flex h-14 w-full items-center gap-2.5 px-2.5'>
              <img src={PureIcon} style={{ width: 30 }} />
              <EditableField
                className='font-bold'
                placeholder='Pure Proxy Account'
                value={pureProxyName || ''}
                onChange={(value) => onDataChange({ pureProxyName: value })}
              />
            </div>
          ) : (
            <InputAddress
              shorten={false}
              value={proxied}
              onChange={(value) => onDataChange({ proxied: value })}
              placeholder='Select account to be proxied'
            />
          )}
        </div>
      </div>

      {/* Create Pure Toggle */}
      <div className='flex items-center justify-between'>
        <div className='flex flex-col'>
          <span className='text-foreground text-sm font-bold'>Create Pure</span>
          <span className='text-foreground/50 text-xs'>
            Pure proxies are new keyless accounts that are created and controlled by&nbsp;
            {proxy ? <AddressName value={proxy} /> : 'your account'}.
          </span>
        </div>
        <Switch
          isSelected={isPureProxy}
          onValueChange={(checked) => {
            onDataChange({
              isPureProxy: checked,
              proxied: checked ? current : proxied
            });
          }}
        />
      </div>

      {/* Notice Alert */}
      <Tips pure={isPureProxy} proxied={proxied} proxy={proxy} />

      {/* Divider */}
      <Divider />

      {/* Action Button */}
      <div className='flex gap-2.5'>
        <Button
          fullWidth
          size='md'
          color='primary'
          radius='full'
          onPress={onNext}
          isDisabled={!validationResult.canProceed}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export default Step1ConfigureAccess;
