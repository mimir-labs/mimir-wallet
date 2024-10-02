// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Avatar, FormControl, MenuItem, Select, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';

import { findToken } from '@mimir-wallet/config';
import { useApi, useAssets } from '@mimir-wallet/hooks';

import { TransferToken } from './types';

function SelectToken({
  assetId,
  onChange,
  setAssetId
}: {
  assetId: string;
  setAssetId: (assetId: string) => void;
  onChange: (value: TransferToken) => void;
}) {
  const { api } = useApi();
  const assets = useAssets();
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
    const _tokens: TransferToken[] = [nativeToken].concat(
      assets.map((item) => ({
        isNative: false,
        assetId: item.assetId,
        icon: item.Icon,
        name: item.name,
        symbol: item.symbol,
        decimals: item.decimals
      }))
    );

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
            <Avatar alt={item.name} src={item.icon} sx={{ width: 32, height: 32 }} />
            <Typography>
              {item.name}{' '}
              <Typography color='text.secondary' component='span'>
                ({item.symbol})
              </Typography>
            </Typography>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default React.memo(SelectToken);
