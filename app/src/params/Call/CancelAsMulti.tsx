// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId32 } from '@polkadot/types/interfaces';
import type { CallProps } from './types';

import { getTypeDef, type Vec } from '@polkadot/types';
import { createKeyMulti } from '@polkadot/util-crypto';
import React, { forwardRef, useMemo } from 'react';

import Param from '../Param';
import Item from '../Param/Item';
import { mergeClasses } from './utils';

const CancelAsMulti = forwardRef<HTMLDivElement | null, CallProps>(
  ({ registry, call, displayType, from, className }, ref) => {
    const multisig = useMemo(() => {
      if (!from) {
        return null;
      }

      const threshold = Number(call.args[0].toString());
      const who = (call.args[1] as Vec<AccountId32>).map((account) => account.toString()).concat(from);

      const multisig = registry.createType('AccountId', createKeyMulti(who, threshold));

      return [multisig, getTypeDef(multisig.toRawType())] as const;
    }, [call, from, registry]);

    return (
      <div ref={ref} className={mergeClasses('flex flex-col gap-2.5', className)}>
        {multisig && (
          <Item
            type={displayType}
            content={
              <Param
                displayType={displayType}
                name='Multisig'
                registry={registry}
                type={multisig[1]}
                value={multisig[0]}
              />
            }
            name='Multisig'
          />
        )}
      </div>
    );
  }
);

CancelAsMulti.displayName = 'CancelAsMulti';

export default React.memo(CancelAsMulti);
