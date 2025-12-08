// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Compact } from '@polkadot/types';
import type {
  AccountId,
  AccountIndex,
  Address,
} from '@polkadot/types/interfaces';
import type { BN } from '@polkadot/util';

import {
  encodeAddress,
  useNetwork,
  useSs58Format,
} from '@mimir-wallet/polkadot-core';
import { Button, Spinner, Tooltip } from '@mimir-wallet/ui';
import React, { useEffect, useMemo, useRef } from 'react';
import { useToggle } from 'react-use';

import AddressName from './AddressName';
import FormatBalance from './FormatBalance';
import Fund from './Fund';

import IconFail from '@/assets/svg/icon-failed-fill.svg?react';
import IconLock from '@/assets/svg/icon-lock.svg?react';
import IconQuestion from '@/assets/svg/icon-question-fill.svg?react';
import IconSuccess from '@/assets/svg/icon-success-fill.svg?react';
import IconUnLock from '@/assets/svg/icon-unlock.svg?react';
import { useBalanceByIdentifier } from '@/hooks/useChainBalances';
import { useExistentialDeposit } from '@/hooks/useExistentialDeposit';
import { formatUnits } from '@/utils';

interface Props {
  isUnLock?: boolean;
  address: AccountId | AccountIndex | Address | string;
  value: Compact<any> | BN | string | number;
  tip?: React.ReactNode;
  onEnoughtState?: (address: string, isEnought: boolean | 'pending') => void;
}

function LockItem({ address, isUnLock, tip, value, onEnoughtState }: Props) {
  const { ss58: chainSS58 } = useSs58Format();
  const { network, chain } = useNetwork();
  const [allBalances] = useBalanceByIdentifier(
    network,
    address.toString(),
    'native',
  );
  const [open, toggleOpen] = useToggle(false);
  const onEnoughtStateRef = useRef(onEnoughtState);
  const { existentialDepositBigInt } = useExistentialDeposit(network);

  onEnoughtStateRef.current = onEnoughtState;

  const isEnought = useMemo(() => {
    if (allBalances && existentialDepositBigInt > 0n) {
      return (
        allBalances.transferrable >=
          BigInt(value.toString()) + existentialDepositBigInt &&
        allBalances.free >= allBalances.locked + BigInt(value.toString())
      );
    }

    return 'pending';
  }, [allBalances, existentialDepositBigInt, value]);

  useEffect(() => {
    onEnoughtStateRef.current?.(
      encodeAddress(address.toString(), chainSS58),
      isEnought,
    );
  }, [address, isEnought, chainSS58]);

  const icon = (
    <div>
      {isUnLock ? (
        <IconUnLock className="text-primary/50" />
      ) : (
        <IconLock className="text-primary/50" />
      )}
    </div>
  );

  return (
    <>
      {value && address && (
        <Fund
          defaultNetwork={network}
          defaultValue={formatUnits(value, chain.nativeDecimals)}
          onClose={() => toggleOpen(false)}
          open={open}
          receipt={address.toString()}
        />
      )}
      <div className="flex items-center gap-[5px] sm:gap-2.5">
        {icon}
        <div className="flex flex-1 items-center gap-[5px] sm:gap-2.5">
          <AddressName value={address} /> {isUnLock ? 'unlock' : 'lock'}
          <Tooltip
            classNames={{ content: 'max-w-[320px]' }}
            content={<span>{tip}</span>}
          >
            <IconQuestion className="text-primary/40" />
          </Tooltip>
        </div>
        <div className="flex items-center gap-[5px] sm:gap-2.5">
          {!isUnLock && isEnought === false && (
            <Button
              color="primary"
              variant="bordered"
              onClick={toggleOpen}
              size="sm"
              className="h-5"
            >
              Fund
            </Button>
          )}

          <span>
            <FormatBalance withCurrency value={value} />
          </span>

          {!isUnLock &&
            (isEnought === 'pending' ? (
              <Spinner size="sm" />
            ) : isEnought ? (
              <IconSuccess className="text-success" />
            ) : (
              <IconFail className="text-danger" />
            ))}
        </div>
      </div>
    </>
  );
}

export const LockContainer = React.memo(
  ({ children }: { children: React.ReactNode }) => {
    return (
      <div className="bg-secondary space-y-2.5 rounded-[10px] p-2.5">
        {children}
      </div>
    );
  },
);

LockContainer.displayName = 'LockContainer';

export default React.memo(LockItem);
