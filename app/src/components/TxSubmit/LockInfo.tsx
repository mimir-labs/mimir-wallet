// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0
// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';
import type { BuildTx } from './hooks/useBuildTx';

import IconClock from '@/assets/svg/icon-clock.svg?react';
import IconQuestion from '@/assets/svg/icon-question-fill.svg?react';
import React, { useState } from 'react';

import { addressToHex } from '@mimir-wallet/polkadot-core';
import { Alert, AlertTitle, Divider, Tooltip } from '@mimir-wallet/ui';

import AddressName from '../AddressName';
import FormatBalance from '../FormatBalance';
import LockItem, { LockContainer } from '../LockItem';

function LockInfo({ buildTx }: { buildTx: BuildTx }) {
  const { reserve, unreserve, delay } = buildTx;
  const [enoughtState, setEnoughtState] = useState<Record<HexString, boolean | 'pending'>>({});

  const isEnought = Object.keys(reserve).reduce<boolean>(
    (result, item) => result && !!enoughtState[addressToHex(item)],
    true
  );
  const isEnoughtPending = Object.keys(reserve).reduce<boolean>(
    (result, item) => result || enoughtState[addressToHex(item)] === 'pending',
    false
  );

  return (
    <>
      <Divider />
      {(Object.keys(reserve).length > 0 || Object.keys(unreserve).length > 0 || Object.keys(delay).length > 0) && (
        <LockContainer>
          {Object.entries(delay).map(([address, delay], index) => (
            <div key={`delay-${address}-${index}`} className='flex items-center justify-between gap-[5px] sm:gap-2.5'>
              <div className='flex items-center gap-[5px] sm:gap-2.5'>
                <IconClock className='text-primary h-4 w-4 opacity-50' />
                <p>Review window</p>
                <Tooltip content='This transaction needs to be executed manually after review window ends.'>
                  <IconQuestion className='text-primary/40' />
                </Tooltip>
              </div>

              <span>{delay.toString()} Blocks</span>
            </div>
          ))}

          {Object.keys(delay).length > 0 && <Divider className='bg-primary/5' />}

          {Object.entries(reserve).map(([address, { value }], index) => (
            <LockItem
              key={`lock-${address}-${index}`}
              address={address}
              isUnLock={false}
              value={value}
              tip={
                <>
                  <FormatBalance value={value} /> in{' '}
                  <b>
                    <AddressName value={address} />
                  </b>{' '}
                  will be reserved for initiate transaction.
                </>
              }
              onEnoughtState={(address, isEnought) =>
                setEnoughtState((state) => ({ ...state, [addressToHex(address)]: isEnought }))
              }
            />
          ))}
          {Object.entries(unreserve).map(([address, { value }], index) => (
            <LockItem
              key={`unlock-${address}-${index}`}
              address={address}
              isUnLock
              value={value}
              tip={
                <>
                  <FormatBalance value={value} /> in{' '}
                  <b>
                    <AddressName value={address} />
                  </b>{' '}
                  will be unreserved for execute transaction.
                </>
              }
            />
          ))}
        </LockContainer>
      )}

      {!isEnought && !isEnoughtPending ? (
        <Alert variant='destructive'>
          <AlertTitle>Insufficient funds</AlertTitle>
        </Alert>
      ) : null}
    </>
  );
}

export default React.memo(LockInfo);
