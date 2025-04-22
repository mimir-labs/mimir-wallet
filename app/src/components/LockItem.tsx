// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Compact } from '@polkadot/types';
import type { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';

import IconFail from '@/assets/svg/icon-failed-fill.svg?react';
import IconFund from '@/assets/svg/icon-fund-fill.svg?react';
import IconLock from '@/assets/svg/icon-lock.svg?react';
import IconQuestion from '@/assets/svg/icon-question-fill.svg?react';
import IconSuccess from '@/assets/svg/icon-success-fill.svg?react';
import IconUnLock from '@/assets/svg/icon-unlock.svg?react';
import { useNativeBalances } from '@/hooks/useBalances';
import { useToggle } from '@/hooks/useToggle';
import { formatUnits } from '@/utils';
import { BN } from '@polkadot/util';
import React, { useEffect, useMemo, useRef } from 'react';

import { encodeAddress, useApi } from '@mimir-wallet/polkadot-core';
import { Alert, Button, Spinner, Tooltip } from '@mimir-wallet/ui';

import AddressName from './AddressName';
import FormatBalance from './FormatBalance';
import Fund from './Fund';

interface Props {
  isUnLock?: boolean;
  address: AccountId | AccountIndex | Address | string;
  value: Compact<any> | BN | string | number;
  tip?: React.ReactNode;
  onEnoughtState?: (address: string, isEnought: boolean | 'pending') => void;
}

function LockItem({ address, isUnLock, tip, value, onEnoughtState }: Props) {
  const { api, chainSS58, network } = useApi();
  const [allBalances] = useNativeBalances(address.toString());
  const [open, toggleOpen] = useToggle();
  const onEnoughtStateRef = useRef(onEnoughtState);

  onEnoughtStateRef.current = onEnoughtState;

  const isEnought = useMemo(() => {
    if (allBalances) {
      return (
        allBalances.transferrable >= BigInt(value.toString()) + api.consts.balances.existentialDeposit.toBigInt() &&
        allBalances.free >= allBalances.locked + BigInt(value.toString())
      );
    }

    return 'pending';
  }, [allBalances, api, value]);

  useEffect(() => {
    onEnoughtStateRef.current?.(encodeAddress(address.toString(), chainSS58), isEnought);
  }, [address, isEnought, chainSS58]);

  const icon = <div>{isUnLock ? <IconUnLock className='text-primary' /> : <IconLock className='text-primary' />}</div>;

  return (
    <>
      {value && address && (
        <Fund
          defaultNetwork={network}
          defaultValue={formatUnits(value, api.registry.chainDecimals[0])}
          onClose={toggleOpen}
          open={open}
          receipt={address.toString()}
        />
      )}
      <Alert
        color={!isEnought && !isUnLock ? 'danger' : 'success'}
        icon={icon}
        endContent={
          <div className='flex items-center gap-[5px] sm:gap-2.5'>
            {!isUnLock && isEnought === false && (
              <Button isIconOnly color='primary' variant='light' onPress={toggleOpen} size='sm'>
                <IconFund />
              </Button>
            )}

            <p>
              <FormatBalance value={value} />
            </p>

            {!isUnLock &&
              (isEnought === 'pending' ? (
                <Spinner size='sm' />
              ) : isEnought ? (
                <IconSuccess className='text-success' />
              ) : (
                <IconFail className='text-danger' />
              ))}
          </div>
        }
      >
        <div className='flex items-center gap-[5px] sm:gap-2.5'>
          <AddressName value={address} /> {isUnLock ? 'unlock' : 'lock'}
          <Tooltip classNames={{ content: 'max-w-[320px]' }} content={<span>{tip}</span>} closeDelay={0}>
            <IconQuestion />
          </Tooltip>
        </div>
      </Alert>
    </>
  );
}

export const LockContainer = React.memo(({ children }: { children: React.ReactNode }) => {
  return <div className='space-y-2.5'>{children}</div>;
});

export default React.memo(LockItem);
