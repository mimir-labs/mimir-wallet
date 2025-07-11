// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { FilterPath } from '@/hooks/types';

import { useAccountSource } from '@/wallet/useWallet';
import React, { useLayoutEffect, useMemo } from 'react';

import SelectFilterPath from '../SelectFilterPath';

interface Props {
  deep: number;
  filterPaths: FilterPath[][];
  addressChain: FilterPath[];
  setAddressChain: React.Dispatch<React.SetStateAction<FilterPath[]>>;
}

function AddressChain({ filterPaths, deep, addressChain, setAddressChain }: Props) {
  const selected = addressChain.at(deep) || '';
  const source = useAccountSource((selected as FilterPath)?.address);

  const addresses = useMemo(
    () => Array.from(new Set(filterPaths.map((item) => item[0]).filter((item) => !!item))),
    [filterPaths]
  );

  useLayoutEffect(() => {
    if (addresses.length && !selected) {
      setAddressChain((value) => {
        const newValue = [...value];

        newValue[deep] = addresses[0];

        return newValue.slice(0, deep + 1);
      });
    }
  }, [addresses, deep, selected, setAddressChain]);

  if (addresses.length === 0 || !selected) {
    return null;
  }

  return (
    <div>
      {deep === 0 && <div className='font-bold text-small mb-2'>Select Signer</div>}
      {deep === 0 && !source ? null : (
        <SelectFilterPath
          filterPaths={addresses}
          value={selected}
          onChange={(value) => {
            setAddressChain((prevValue) => {
              const item = addresses.find((item) => item.id === value.id);

              if (item) {
                const newValue = [...prevValue];

                newValue[deep] = item;

                return newValue.slice(0, deep + 1);
              }

              return prevValue;
            });
          }}
        />
      )}

      {!source && (
        <div style={{ paddingTop: deep === 0 ? 0 : 10, paddingLeft: deep === 0 ? 0 : 10 }}>
          <AddressChain
            addressChain={addressChain}
            deep={deep + 1}
            filterPaths={filterPaths.filter((item) => item[0]?.id === selected.id).map((item) => item.slice(1))}
            setAddressChain={setAddressChain}
          />
        </div>
      )}
    </div>
  );
}

export default React.memo(AddressChain);
