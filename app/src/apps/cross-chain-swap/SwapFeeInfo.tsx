// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SwapRouteStep } from './types';
import type { XcmFeeAsset } from '@mimir-wallet/polkadot-core';

import { Avatar, cn, Tooltip } from '@mimir-wallet/ui';
import React from 'react';

import IconQuestion from '@/assets/svg/icon-question-fill.svg?react';
import FormatBalance from '@/components/FormatBalance';

interface SwapFeeInfoProps {
  time?: string;
  originFee?: XcmFeeAsset;
  destFee?: XcmFeeAsset;
  route?: SwapRouteStep[];
  exchangeRate?: string;
}

function FeeRow({
  icon,
  label,
  value,
  tooltip,
  valueClassName,
}: {
  icon: string;
  label: string;
  value?: React.ReactNode;
  tooltip?: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex gap-[5px] items-center justify-between w-full">
      <div className="flex items-center gap-[5px]">
        <span className="text-sm">{icon}</span>
        <span className="text-sm">{label}</span>
        {tooltip && (
          <Tooltip content={tooltip}>
            <IconQuestion className="size-4 text-foreground/50 cursor-help" />
          </Tooltip>
        )}
      </div>
      <span className={cn('text-sm', valueClassName)}>{value ?? '--'}</span>
    </div>
  );
}

function RouteDisplay({ route }: { route: SwapRouteStep[] }) {
  if (!route || route.length === 0) return <span>--</span>;

  return (
    <div className="flex items-center gap-1">
      {route.map((step, index) => (
        <React.Fragment key={index}>
          <Avatar
            alt={step.network.name}
            fallback={step.network.name?.slice(0, 1) || '?'}
            src={step.network.icon}
            style={{ width: 16, height: 16 }}
          />
          {index < route.length - 1 && (
            <span className="text-foreground/50">→</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function SwapFeeInfo({
  time,
  originFee,
  destFee,
  route,
  exchangeRate,
}: SwapFeeInfoProps) {
  return (
    <div className="bg-primary/5 rounded-[10px] p-2.5 flex flex-col gap-2.5">
      <FeeRow
        icon="⏰"
        label="Time"
        value={time}
        tooltip="Estimated time for the cross-chain swap to complete"
      />
      <FeeRow
        icon="💰"
        label="Origin Fee"
        value={
          originFee ? (
            <FormatBalance
              value={originFee.fee}
              format={[originFee.decimals, originFee.symbol]}
              withCurrency
            />
          ) : undefined
        }
        tooltip="Fee paid on the source chain"
      />
      <FeeRow
        icon="💰"
        label="Destination Fee"
        value={
          destFee ? (
            <FormatBalance
              value={destFee.fee}
              format={[destFee.decimals, destFee.symbol]}
              withCurrency
            />
          ) : undefined
        }
        tooltip="Fee paid on the destination chain"
      />
      <FeeRow
        icon="🗺️"
        label="Route"
        value={<RouteDisplay route={route || []} />}
        tooltip="The path your tokens will take across chains"
      />
      {exchangeRate && (
        <FeeRow
          icon="💱"
          label="Rate"
          value={exchangeRate}
          tooltip="Exchange rate for this swap"
        />
      )}
    </div>
  );
}

export default SwapFeeInfo;
