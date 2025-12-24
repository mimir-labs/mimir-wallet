// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { XcmFeeAsset } from '@mimir-wallet/polkadot-core';

import { Tooltip } from '@mimir-wallet/ui';

import IconQuestion from '@/assets/svg/icon-question-fill.svg?react';
import FormatBalance from '@/components/FormatBalance';

interface FeeInfoProps {
  time?: string;
  originFee?: XcmFeeAsset;
  destFee?: XcmFeeAsset;
  receivableAmount?: XcmFeeAsset;
}

function FeeRow({
  icon,
  label,
  value,
  tooltip,
}: {
  icon: string;
  label: string;
  value?: React.ReactNode;
  tooltip?: string;
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
      <span className="text-sm">{value ?? '--'}</span>
    </div>
  );
}

function FeeInfo({ time, originFee, destFee, receivableAmount }: FeeInfoProps) {
  return (
    <div className="bg-primary/5 rounded-[10px] p-2.5 flex flex-col gap-2.5">
      <FeeRow
        icon="⏰"
        label="Time"
        value={time}
        tooltip="Estimated time for the cross-chain transfer to complete"
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
        icon="📥"
        label="You will receive"
        value={
          receivableAmount ? (
            <FormatBalance
              value={receivableAmount.fee}
              format={[receivableAmount.decimals, receivableAmount.symbol]}
              withCurrency
            />
          ) : undefined
        }
        tooltip="Amount you will receive on the destination chain after fees"
      />
    </div>
  );
}

export default FeeInfo;
