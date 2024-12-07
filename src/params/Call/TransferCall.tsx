// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { CallProps } from '../types';

import { alpha, Box, lighten, Skeleton } from '@mui/material';
import React, { useMemo } from 'react';

import { Address, AddressName, CopyButton, FormatBalance, IdentityIcon } from '@mimir-wallet/components';
import { ellipsisMixin } from '@mimir-wallet/components/utils';
import { useAssetInfo } from '@mimir-wallet/hooks';

import { findAction } from '../utils';
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
          <CopyButton size='small' value={address} color='default' sx={{ color: 'text.secondary' }} />
        </Box>
        <Box sx={{ fontSize: '10px', color: 'text.secondary', lineHeight: '12px' }}>
          <Address shorten value={address} />
        </Box>
      </Box>
    </Box>
  );
}

function TransferCall({ from: propFrom, registry, call, jsonFallback }: CallProps) {
  const action = useMemo(() => findAction(registry, call), [registry, call]);

  const results = useMemo(() => {
    let assetId: string | null = null;
    let from: string | undefined = propFrom;
    let to: string;
    let value: string;
    let isAll: boolean = false;

    if (!action) {
      return null;
    }

    const [section, method] = action;

    if (section !== 'balances' && section !== 'assets' && section !== 'tokens') {
      return null;
    }

    if (section === 'balances') {
      if (method === 'forceTransfer') {
        from = call.args[0].toString();
        to = call.args[1].toString();
        value = call.args[2].toString();
      } else if (method === 'transferAll') {
        to = call.args[0].toString();
        value = '0';
        isAll = true;
      } else if (method === 'transferAllowDeath' || method === 'transferKeepAlive') {
        to = call.args[0].toString();
        value = call.args[1].toString();
      } else {
        return null;
      }
    } else if (section === 'assets') {
      if (method === 'forceTransfer') {
        assetId = call.args[0].toString();
        from = call.args[1].toString();
        to = call.args[2].toString();
        value = call.args[3].toString();
      } else if (method === 'transfer' || method === 'transferKeepAlive') {
        assetId = call.args[0].toString();
        to = call.args[1].toString();
        value = call.args[2].toString();
      } else if (method === 'transferAll') {
        assetId = call.args[1].toString();
        to = call.args[0].toString();
        value = '0';
        isAll = true;
      } else {
        return null;
      }
    } else if (section === 'tokens') {
      if (method === 'transfer' || method === 'transferKeepAlive') {
        assetId = call.args[1].toString();
        to = call.args[0].toString();
        value = call.args[2].toString();
      } else if (method === 'forceTransfer') {
        to = call.args[1].toString();
        from = call.args[0].toString();
        assetId = call.args[2].toString();
        value = call.args[3].toString();
      } else if (method === 'transferAll') {
        to = call.args[0].toString();
        assetId = call.args[1].toString();
        value = '0';
        isAll = true;
      } else {
        return null;
      }
    } else {
      return null;
    }

    return [assetId, from, to, value, isAll] as const;
  }, [action, call.args, propFrom]);

  const [assetInfo] = useAssetInfo(results?.[0]);

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
          {isAll ? (
            'All'
          ) : assetId !== null ? (
            assetInfo ? (
              <FormatBalance value={value} withCurrency format={[assetInfo.decimals, assetInfo.symbol]} />
            ) : (
              <Skeleton variant='text' sx={{ width: 50 }} />
            )
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
