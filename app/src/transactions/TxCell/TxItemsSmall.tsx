// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Transaction } from '@/hooks/types';

import { Button } from '@mimir-wallet/ui';
import { useNavigate } from '@tanstack/react-router';
import React from 'react';

import ArrowRight from '@/assets/svg/ArrowRight.svg?react';
import { AppName } from '@/components';
import { CallDisplaySection } from '@/params';

function AppCell({ transaction }: { transaction: Transaction }) {
  return (
    <AppName
      website={transaction.website}
      appName={transaction.appName}
      iconUrl={transaction.iconUrl}
    />
  );
}

function ActionTextCell({
  section,
  method,
}: {
  section?: string;
  method?: string;
}) {
  return <CallDisplaySection section={section} method={method} />;
}

function ActionsCell() {
  return (
    <Button
      continuePropagation
      color="primary"
      size="sm"
      variant="light"
      isIconOnly
    >
      <ArrowRight className="text-primary h-4 w-4" />
    </Button>
  );
}

function TxItems({ transaction }: { transaction: Transaction }) {
  const navigate = useNavigate();

  return (
    <div
      className="bg-secondary grid cursor-pointer grid-cols-7 overflow-hidden rounded-[10px] px-2.5 font-semibold [&_div]:flex [&_div]:h-10 [&_div]:items-center"
      onClick={() => {
        navigate({
          to: '/transactions/$id',
          params: { id: transaction.id.toString() },
        });
      }}
    >
      <div className="col-span-3">
        <AppCell transaction={transaction} />
      </div>
      <div className="col-span-3 flex justify-center">
        <ActionTextCell
          section={transaction.section}
          method={transaction.method}
        />
      </div>
      <div className="col-span-1 flex justify-end">
        <ActionsCell />
      </div>
    </div>
  );
}

export default React.memo(TxItems);
