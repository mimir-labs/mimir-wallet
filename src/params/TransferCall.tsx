// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { CallProps } from './types';

import { alpha, Box, lighten, Skeleton } from '@mui/material';
import React, { useMemo } from 'react';

import { AddressName, CopyButton, FormatBalance, IdentityIcon } from '@mimir-wallet/components';
import { useAssetInfo } from '@mimir-wallet/hooks';

import FunctionArgs from './FunctionArgs';
import { findAction } from './utils';

function AddressDisplay({
  reverse,
  address,
  children
}: {
  reverse: boolean;
  address: string;
  children: React.ReactNode;
}) {
  return (
    <Box
      data-reverse={reverse}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        columnGap: 1,
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
          <AddressName value={address} />
          <CopyButton size='small' value={address} color='default' sx={{ color: 'text.secondary' }} />
        </Box>
        <Box sx={{ fontSize: '10px', color: 'text.secondary', lineHeight: '12px' }}>{children}</Box>
      </Box>
    </Box>
  );
}

function TransferCall({ from: propFrom, api, call, jsonFallback }: CallProps) {
  const [section, method] = useMemo(() => findAction(api, call), [api, call]);

  const results = useMemo(() => {
    let assetId: string | null = null;
    let from: string = propFrom;
    let to: string;
    let value: string;
    let isAll: boolean = false;

    if (section !== 'balances' && section !== 'assets') {
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
    } else if (method === 'forceTransfer') {
      assetId = call.args[0].toString();
      from = call.args[1].toString();
      to = call.args[2].toString();
      value = call.args[3].toString();
    } else if (method === 'transfer' || method === 'transferKeepAlive') {
      assetId = call.args[0].toString();
      to = call.args[1].toString();
      value = call.args[2].toString();
    } else {
      return null;
    }

    return [assetId, from, to, value, isAll] as const;
  }, [call.args, method, propFrom, section]);
  const assetInfo = useAssetInfo(results?.[0]);

  if (!results) return <FunctionArgs from={propFrom} api={api} call={call} jsonFallback={jsonFallback} />;

  const [assetId, from, to, value, isAll] = results;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 3 }}>
      <AddressDisplay reverse={false} address={from}>
        Sender
      </AddressDisplay>
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
      <AddressDisplay reverse address={to}>
        Recipient
      </AddressDisplay>
    </Box>
  );
}

export default React.memo(TransferCall);
