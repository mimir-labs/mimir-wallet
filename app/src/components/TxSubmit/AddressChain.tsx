// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { FilterPath } from '@/hooks/types';

import IconClock from '@/assets/svg/icon-clock.svg?react';
import { AddressCell } from '@/components';
import { useAccountSource } from '@/wallet/useWallet';
import { Box, FormControl, InputLabel, MenuItem, Select, SvgIcon } from '@mui/material';
import React, { useLayoutEffect, useMemo } from 'react';

import { Chip } from '@mimir-wallet/ui';

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

  if (addresses.length === 0) {
    return null;
  }

  return (
    <div>
      <FormControl fullWidth>
        {deep === 0 && <InputLabel>Select Signer</InputLabel>}

        <Select<string>
          sx={{ display: deep === 0 ? 'none' : undefined }}
          fullWidth
          variant='outlined'
          displayEmpty
          onChange={(e) => {
            setAddressChain((value) => {
              const item = addresses.find((item) => item.id === e.target.value);

              if (item) {
                const newValue = [...value];

                newValue[deep] = item;

                return newValue.slice(0, deep + 1);
              }

              return value;
            });
          }}
          value={typeof selected === 'string' ? selected : selected.id}
        >
          <MenuItem value='' disabled>
            Please select address
          </MenuItem>
          {addresses.map((item, index) => (
            <MenuItem value={item.id} key={index}>
              <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <AddressCell value={item.address} withCopy showType />
                {item.type !== 'origin' && (
                  <Chip
                    color={
                      item.type === 'multisig'
                        ? 'secondary'
                        : item.type === 'proxy'
                          ? 'default'
                          : item.type === 'proposer'
                            ? 'default'
                            : 'primary'
                    }
                    size='sm'
                    data-type={item.type}
                    className='data-[type=proxy]:bg-[#B700FF]/5 data-[type=proxy]:text-[#B700FF] data-[type=proposer]:bg-[#00A19C]/5 data-[type=proposer]:text-[#00A19C]'
                  >
                    {item.type === 'multisig'
                      ? 'AsMulti'
                      : item.type === 'proxy'
                        ? 'Proxy'
                        : item.type === 'proposer'
                          ? 'Proposer'
                          : ''}
                  </Chip>
                )}
                {item.type === 'proxy' && (
                  <Chip color='secondary' size='sm'>
                    {
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {!!item.delay && <SvgIcon component={IconClock} inheritViewBox sx={{ fontSize: '0.75rem' }} />}
                        {item.proxyType}
                      </Box>
                    }
                  </Chip>
                )}
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selected && !source && (
        <Box sx={{ paddingTop: deep === 0 ? 0 : 1, paddingLeft: deep === 0 ? 0 : 1 }}>
          <AddressChain
            addressChain={addressChain}
            deep={deep + 1}
            filterPaths={filterPaths.filter((item) => item[0]?.id === selected.id).map((item) => item.slice(1))}
            setAddressChain={setAddressChain}
          />
        </Box>
      )}
    </div>
  );
}

export default React.memo(AddressChain);
