// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Switch } from '@mimir-wallet/ui';

function AddPureProxy({
  isDisabled,
  isPureProxy,
  onPureProxyChange
}: {
  isDisabled?: boolean;
  isPureProxy: boolean;
  onPureProxyChange?: (value: boolean) => void;
}) {
  return (
    <div className='flex items-center justify-between'>
      <div className='flex-1'>
        <p className='text-foreground text-sm font-bold'>Add Pure Proxy</p>
        <p className='text-foreground/50 text-xs'>This allows you to change signers and thresholds</p>
      </div>
      <Switch isDisabled={isDisabled} size='sm' isSelected={isPureProxy} onValueChange={onPureProxyChange} />
    </div>
  );
}

export default AddPureProxy;
