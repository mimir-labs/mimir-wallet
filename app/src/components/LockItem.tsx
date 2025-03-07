// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Compact } from '@polkadot/types';
import type { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';

import { encodeAddress } from '@/api';
import IconFail from '@/assets/svg/icon-failed-fill.svg?react';
import IconFund from '@/assets/svg/icon-fund-fill.svg?react';
import IconLock from '@/assets/svg/icon-lock.svg?react';
import IconQuestion from '@/assets/svg/icon-question-fill.svg?react';
import IconSuccess from '@/assets/svg/icon-success-fill.svg?react';
import IconUnLock from '@/assets/svg/icon-unlock.svg?react';
import { useApi } from '@/hooks/useApi';
import { useNativeBalances } from '@/hooks/useBalances';
import { useToggle } from '@/hooks/useToggle';
import { formatUnits } from '@/utils';
import { Stack } from '@mui/system';
import { BN } from '@polkadot/util';
import React, { useEffect, useMemo, useRef } from 'react';

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
  const { api } = useApi();
  const [allBalances] = useNativeBalances(address.toString());
  const [open, toggleOpen] = useToggle();
  const onEnoughtStateRef = useRef(onEnoughtState);

  onEnoughtStateRef.current = onEnoughtState;

  const isEnought = useMemo(() => {
    if (allBalances) {
      return allBalances.transferrable.gte(new BN(value.toString()));
    }

    return 'pending';
  }, [allBalances, value]);

  useEffect(() => {
    onEnoughtStateRef.current?.(encodeAddress(address.toString()), isEnought);
  }, [address, isEnought]);

  const icon = <div>{isUnLock ? <IconUnLock className='text-primary' /> : <IconLock className='text-primary' />}</div>;

  return (
    <>
      {value && address && (
        <Fund
          defaultValue={formatUnits(value, api.registry.chainDecimals[0])}
          onClose={toggleOpen}
          open={open}
          receipt={address.toString()}
        />
      )}
      <Alert
        color={isEnought ? 'success' : 'danger'}
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
                <Spinner size='sm' variant='spinner' />
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
  return <Stack spacing={1}>{children}</Stack>;
});

export default React.memo(LockItem);
