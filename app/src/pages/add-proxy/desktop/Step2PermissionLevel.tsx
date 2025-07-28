// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DelayType } from '../types';

import PureIcon from '@/assets/images/pure-icon.svg';
import { AddressCell, ProxyControls } from '@/components';

import { Button, Divider, Switch } from '@mimir-wallet/ui';

import DelayItem from '../components/DelayItem';
import ProxyPermissionSelector from '../components/ProxyPermissionSelector';
import { DEFAULT_PURE_ACCOUNT_NAME } from '../utils';

interface Step2PermissionLevelProps {
  proxyType: string;
  hasDelay: boolean;
  delayType: DelayType;
  customBlocks: string;
  proxy: string | undefined;
  proxied: string | undefined;
  isPureProxy: boolean;
  pureProxyName?: string;
  onNext: () => void;
  onBack: () => void;
  onDataChange: (updates: {
    proxyType?: string;
    hasDelay?: boolean;
    delayType?: DelayType;
    customBlocks?: string;
  }) => void;
}

function Step2PermissionLevel({
  proxyType,
  hasDelay,
  delayType,
  customBlocks,
  proxy,
  proxied,
  isPureProxy,
  pureProxyName,
  onNext,
  onBack,
  onDataChange
}: Step2PermissionLevelProps) {
  const handleDelayTypeChange = (type: DelayType) => {
    onDataChange({ delayType: type });
  };

  return (
    <div className='flex flex-col gap-4'>
      {/* Configure Proxy Access Summary */}
      <div className='flex flex-col gap-1'>
        <label className='text-foreground text-sm font-bold'>Configure Proxy Access</label>
        <div className='relative flex flex-col items-center gap-[5px]'>
          {/* Proxy Account (Upper) */}
          <div className='bg-secondary rounded-medium w-full p-2.5'>
            <AddressCell shorten={false} value={proxy} />
          </div>

          <ProxyControls proxyType={proxyType} className='!absolute inset-x-auto inset-y-0 z-10 m-auto' />

          {/* Proxied Account (Lower) */}
          {isPureProxy ? (
            <div className='bg-secondary rounded-medium flex h-14 w-full items-center gap-2.5 px-2.5'>
              <img src={PureIcon} style={{ width: 30 }} />
              <span className='text-foreground font-bold'>{pureProxyName || DEFAULT_PURE_ACCOUNT_NAME}</span>
            </div>
          ) : (
            <div className='bg-secondary rounded-medium w-full p-2.5'>
              <AddressCell value={proxied} />
            </div>
          )}
        </div>
      </div>

      {/* Permission Level */}
      <ProxyPermissionSelector
        value={proxyType}
        onChange={(value) => onDataChange({ proxyType: value })}
        label='Permission Level'
        description='What functions an account execute on behalf of another.'
        variant='bordered'
      />

      {/* Time Delay */}
      <div className='flex flex-col gap-1'>
        <div className='flex items-center justify-between'>
          <label className='text-foreground text-sm font-bold'>{hasDelay ? 'Delay' : 'Time Delay'}</label>
          <Switch size='sm' isSelected={hasDelay} onValueChange={(checked) => onDataChange({ hasDelay: checked })} />
        </div>
        <p className='text-foreground/50 text-tiny'>
          {hasDelay
            ? 'The proxy will announce its intended action and will wait for the number of blocks defined in the delay time before executing it.'
            : 'Require waiting period before transactions execute for extra security.'}
        </p>

        {hasDelay && (
          <div className='mt-3 flex flex-col gap-3'>
            <label className='text-foreground text-sm font-bold'>Delay Time</label>
            <div className='flex gap-2'>
              <DelayItem isSelected={delayType === 'hour'} delayType='hour' onSelect={handleDelayTypeChange} />
              <DelayItem isSelected={delayType === 'day'} delayType='day' onSelect={handleDelayTypeChange} />
              <DelayItem isSelected={delayType === 'week'} delayType='week' onSelect={handleDelayTypeChange} />
              <DelayItem
                isSelected={delayType === 'custom'}
                delayType='custom'
                onSelect={handleDelayTypeChange}
                customBlocks={customBlocks}
                onCustomBlockChange={(value) => onDataChange({ customBlocks: value })}
              />
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <Divider />

      {/* Action Buttons */}
      <div className='flex gap-2.5'>
        <Button fullWidth size='md' variant='ghost' color='primary' radius='full' onPress={onBack}>
          Back
        </Button>
        <Button fullWidth size='md' color='primary' radius='full' onPress={onNext}>
          Next
        </Button>
      </div>
    </div>
  );
}

export default Step2PermissionLevel;
