// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { CallProps } from '../types';

import { Address, AddressName, CopyAddress, FormatBalance, IdentityIcon } from '@/components';
import { ellipsisMixin } from '@/components/utils';
import { useAssetInfo } from '@/hooks/useAssets';
import { useParseTransfer } from '@/hooks/useParseTransfer';
import { alpha, Box, lighten, Skeleton } from '@mui/material';
import React from 'react';

import { useApi } from '@mimir-wallet/polkadot-core';

import FunctionArgs from './FunctionArgs';

function AddressDisplay({ reverse, address }: { reverse: boolean; address?: string }) {
  return (
    <Box
      data-reverse={reverse}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        columnGap: { sm: 1, xs: 0.5 },
        flexGrow: 0,
        flexDirection: reverse ? 'row-reverse' : 'row',
        textAlign: reverse ? 'right' : 'left'
      }}
    >
      <IdentityIcon size={24} value={address} />
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Box
          sx={{
            display: 'inline-flex',
            flexDirection: reverse ? 'row-reverse' : 'row',
            alignItems: 'center',
            fontWeight: 700,
            fontSize: '0.875rem',
            lineHeight: '16px',
            height: '16px',
            maxHeight: '16px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '120px',
            gap: 0.4
          }}
        >
          <Box component='span' sx={{ ...ellipsisMixin(150) }}>
            <AddressName value={address} />
          </Box>
          {address && <CopyAddress address={address} size='sm' color='default' />}
        </Box>
        <Box sx={{ fontSize: '10px', color: 'text.secondary', lineHeight: '12px' }}>
          <Address shorten value={address} />
        </Box>
      </Box>
    </Box>
  );
}

function TransferCall({ from: propFrom, registry, call, jsonFallback }: CallProps) {
  const { network } = useApi();
  const results = useParseTransfer(registry, propFrom, call);

  const [assetInfo] = useAssetInfo(network, results?.[0]);

  if (!results) return <FunctionArgs from={propFrom} registry={registry} call={call} jsonFallback={jsonFallback} />;

  const [assetId, from, to, value, isAll] = results;

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: { md: 3, sm: 2, xs: 1 }
      }}
    >
      <AddressDisplay reverse={false} address={from} />
      <Box
        sx={({ palette }) => ({
          position: 'relative',
          flex: '1',
          display: 'flex',
          alignItems: 'center',
          color: palette.text.secondary
        })}
      >
        <Box
          sx={({ palette }) => ({
            width: 6,
            height: 6,
            borderRadius: '3px',
            bgcolor: alpha(palette.text.primary, 0.5)
          })}
        />
        <Box
          sx={({ palette }) => ({
            flex: '1',
            borderTop: '1px dashed',
            borderColor: alpha(palette.text.primary, 0.5)
          })}
        />
        <svg width='6' height='8' xmlns='http://www.w3.org/2000/svg' style={{ color: 'inherit' }}>
          <polygon points='0,0 6,4 0,8' fill='currentColor' />
        </svg>
        <Box
          sx={({ palette }) => ({
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            alignItems: 'center',
            paddingX: 1.2,
            paddingY: 0.4,
            gap: 0.4,
            fontWeight: 700,
            fontSize: '0.875rem',
            lineHeight: 1,
            bgcolor: lighten(palette.text.primary, 0.95),
            border: '1px solid',
            borderColor: lighten(palette.primary.main, 0.95),
            borderRadius: 9999
          })}
        >
          {assetId !== null ? (
            assetInfo ? (
              isAll ? (
                `All ${assetInfo.symbol}`
              ) : (
                <FormatBalance value={value} withCurrency format={[assetInfo.decimals, assetInfo.symbol]} />
              )
            ) : (
              <Skeleton variant='text' sx={{ width: 50 }} />
            )
          ) : isAll ? (
            'All'
          ) : (
            <FormatBalance value={value} withCurrency />
          )}
        </Box>
      </Box>
      <AddressDisplay reverse address={to} />
    </Box>
  );
}

export default React.memo(TransferCall);
