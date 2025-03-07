// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TransferToken } from './types';

import { findToken } from '@/config';
import { useApi } from '@/hooks/useApi';
import { useAssetBalances } from '@/hooks/useBalances';
import { Avatar, FormControl, MenuItem, Select } from '@mui/material';
import React, { useEffect, useState } from 'react';

function SelectToken({
  address,
  assetId,
  onChange,
  setAssetId
}: {
  address?: string;
  assetId: string;
  setAssetId: (assetId: string) => void;
  onChange: (value: TransferToken) => void;
}) {
  const { api } = useApi();
  const assets = useAssetBalances(address);
  const [tokens, setTokens] = useState<TransferToken[]>([]);

  useEffect(() => {
    const native = findToken(api.genesisHash.toHex());

    const nativeToken: TransferToken = {
      isNative: true,
      assetId: 'native',
      icon: native.Icon,
      name: api.runtimeChain.toString(),
      symbol: api.registry.chainTokens[0].toString(),
      decimals: api.registry.chainDecimals[0]
    };
    const _tokens: TransferToken[] = [nativeToken, ...assets];

    setTokens(_tokens);
  }, [api, assets]);

  useEffect(() => {
    const token = tokens.find((item) => item.assetId === assetId);

    token && onChange(token);
  }, [assetId, onChange, tokens]);

  return (
    <FormControl fullWidth>
      <Select<string>
        onChange={(e) => {
          setAssetId(e.target.value);
        }}
        slotProps={{
          input: {
            sx: { display: 'flex', alignItems: 'center', gap: 1 }
          }
        }}
        value={assetId}
      >
        {tokens.map((item) => (
          <MenuItem
            key={item.isNative ? item.name : item.assetId}
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            value={item.assetId}
          >
            <Avatar alt={item.name} src={item.icon} sx={{ width: 32, height: 32 }}>
              {(item.symbol || item.name).slice(0, 1)}
            </Avatar>
            <p>
              {item.name} <span className='text-foreground/50'>({item.symbol})</span>
            </p>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default React.memo(SelectToken);
