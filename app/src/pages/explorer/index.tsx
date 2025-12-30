// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { store } from '@mimir-wallet/service';
import { Button, Tabs } from '@mimir-wallet/ui';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useMemo } from 'react';

import AppFrame from './AppFrame';

import CrossChainSwap from '@/apps/cross-chain-swap';
import CrossChainTransfer from '@/apps/cross-chain-transfer';
import MultiTransfer from '@/apps/multi-transfer';
import SubmitCalldata from '@/apps/submit-calldata';
import Transfer from '@/apps/transfer';
import { type CustomDappOption, dapps } from '@/config';
import { CUSTOM_APP_KEY } from '@/constants';

// Transfer group apps that share the same Tabs
const TRANSFER_GROUP = [
  'mimir://app/transfer',
  'mimir://app/multi-transfer',
  'mimir://app/cross-chain-transfer',
];

function TransferGroup({ url }: { url: string }) {
  const navigate = useNavigate();
  const _url = decodeURIComponent(url);

  const selectedKey = useMemo(() => {
    if (_url.startsWith('mimir://app/multi-transfer')) {
      return 'mimir://app/multi-transfer';
    }

    if (_url.startsWith('mimir://app/cross-chain-transfer')) {
      return 'mimir://app/cross-chain-transfer';
    }

    return 'mimir://app/transfer';
  }, [_url]);

  const renderContent = () => {
    switch (selectedKey) {
      case 'mimir://app/multi-transfer':
        return <MultiTransfer />;
      case 'mimir://app/cross-chain-transfer':
        return <CrossChainTransfer />;
      default:
        return <Transfer />;
    }
  };

  return (
    <div className="mx-auto w-full max-w-[500px] flex flex-col gap-4 p-3 sm:p-5">
      <Button
        className="self-start"
        onClick={() => window.history.back()}
        variant="ghost"
      >
        {'<'} Back
      </Button>
      <Tabs
        variant="pill"
        tabs={[
          { key: 'mimir://app/transfer', label: 'Transfer' },
          { key: 'mimir://app/multi-transfer', label: 'Multi-Transfer' },
          { key: 'mimir://app/cross-chain-transfer', label: 'Cross-chain' },
        ]}
        selectedKey={selectedKey}
        onSelectionChange={(key) => {
          navigate({
            to: '/explorer/$url',
            params: { url: key },
          });
        }}
      />
      {renderContent()}
    </div>
  );
}

function AppExplorer() {
  const { url } = useParams({ from: '/_authenticated/explorer/$url' });

  // Check if URL is in transfer group
  const isTransferGroup = useMemo(() => {
    if (!url) return false;
    const _url = decodeURIComponent(url);

    return TRANSFER_GROUP.some((prefix) => _url.startsWith(prefix));
  }, [url]);

  // Derive element using useMemo instead of useEffect + setState
  const element = useMemo(() => {
    // Skip if in transfer group (handled separately) or no url
    if (isTransferGroup || !url) return undefined;

    const _url = decodeURIComponent(url);

    // Skip mimir:// internal apps (handled by conditional rendering below)
    if (_url.startsWith('mimir://app')) return undefined;

    const customApps = Object.values(
      (store.get(CUSTOM_APP_KEY) || {}) as Record<
        string | number,
        CustomDappOption
      >,
    );
    const apps = [...dapps, ...customApps];
    const app = apps.find((item) => _url.startsWith(item.url));

    return <AppFrame url={url} iconUrl={app?.icon} appName={app?.name} />;
  }, [url, isTransferGroup]);

  // Render transfer group with shared Tabs
  if (isTransferGroup && url) {
    return <TransferGroup url={url} />;
  }

  return url.startsWith('mimir://app/submit-calldata') ? (
    <div className="mx-auto w-full max-w-[500px] flex flex-col gap-4 p-3 sm:p-5">
      <SubmitCalldata />
    </div>
  ) : url.startsWith('mimir://app/cross-chain-swap') ? (
    <CrossChainSwap />
  ) : (
    <div className="h-full">{element}</div>
  );
}

export default AppExplorer;
