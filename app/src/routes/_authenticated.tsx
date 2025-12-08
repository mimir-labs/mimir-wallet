// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { LayoutOptions } from '@/router';

import { SidebarProvider } from '@mimir-wallet/ui';
import {
  createFileRoute,
  Navigate,
  Outlet,
  useLocation,
  useMatches,
} from '@tanstack/react-router';
import { useCallback, useState } from 'react';

import { useAccount } from '../accounts/useAccount';
import { AddressModalsProvider } from '../containers/address';
import { CSS_VARS, layoutHelpers } from '../containers/constants';
import CookieConsent from '../containers/CookieConsent';
import { AppSidebar, RightSideBar } from '../containers/sidebar';
import ToggleAlert from '../containers/ToggleAlert';
import TopBar from '../containers/topbar';
import Version from '../containers/Version';

import { TxSubmit } from '@/components';
import { MigrationAlert } from '@/features/assethub-migration';
import { useAIFunctionCall } from '@/hooks/useAIFunctionCall';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useTxQueue } from '@/hooks/useTxQueue';
import { useUpdateAIContext } from '@/hooks/useUpdateAIContext';

/**
 * Authenticated Layout Route
 *
 * This layout route handles:
 * - Authentication check via beforeLoad (moved to component for now)
 * - Common UI components (sidebar, topbar, alerts)
 *
 * Note: Authentication check is performed in the component itself
 * because we need access to useAccount hook. We'll redirect if not authenticated.
 */
export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
});

// Top section component (TopBar + Alert)
interface TopSectionProps {
  current: string | null | undefined;
  setAlertOpen: (open: boolean) => void;
}

const TopSection = ({ current, setAlertOpen }: TopSectionProps) => {
  const handleSetAlertOpen = useCallback(
    (open: boolean) => {
      setAlertOpen(open);
    },
    [setAlertOpen],
  );
  const [, setAlertCounts] = useState<number>(0);

  return (
    <>
      <TopBar />
      <div className="fixed top-14 right-0 left-0 z-50 flex w-full flex-col gap-2.5 p-2.5">
        {current && (
          <ToggleAlert address={current} setAlertOpen={handleSetAlertOpen} />
        )}
        <MigrationAlert onMigrationCounts={setAlertCounts} />
      </div>
    </>
  );
};

// Transaction overlay component
interface TransactionOverlayProps {
  queue: any[];
}

const TransactionOverlay = ({ queue }: TransactionOverlayProps) => {
  if (queue.length === 0) return null;

  return (
    <div className="absolute inset-0 z-50 flex-auto">
      <TxSubmit key={queue[0].id} {...queue[0]} />
    </div>
  );
};

// Content area component
interface ContentAreaProps {
  withPadding: boolean;
  isTransactionActive: boolean;
}

const ContentArea = ({
  withPadding,
  isTransactionActive,
}: ContentAreaProps) => {
  const contentStyle: React.CSSProperties = {
    display: isTransactionActive ? 'none' : 'flex',
    padding: withPadding ? undefined : 0,
  };

  const versionStyle: React.CSSProperties = {
    padding: withPadding ? 0 : '0 0 16px 16px',
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 sm:p-5" style={contentStyle}>
      <div className="z-10 h-full flex-1">
        <Outlet />
      </div>

      <div style={versionStyle}>
        <Version />
      </div>
    </div>
  );
};

// Main content component
interface MainContentProps {
  withPadding: boolean;
  queue: any[];
}

const MainContent = ({ withPadding, queue }: MainContentProps) => {
  const contentHeight = layoutHelpers.getContentHeight();
  const isTransactionActive = queue.length > 0;

  return (
    <div
      className="z-0 flex w-full flex-1"
      style={{ minHeight: contentHeight }}
    >
      <AppSidebar />

      <main
        className="relative flex w-full flex-1 flex-col"
        style={{
          background: 'var(--color-main-bg)',
        }}
      >
        <ContentArea
          withPadding={withPadding}
          isTransactionActive={isTransactionActive}
        />

        <TransactionOverlay queue={queue} />

        {/* Cookie Consent Banner - Absolute positioned */}
        <CookieConsent />
      </main>

      <RightSideBar />
    </div>
  );
};

function AuthenticatedLayout() {
  // Get layout options from matched routes (set by child routes via beforeLoad)
  const matches = useMatches();

  // Find the deepest route that has layoutOptions in its context
  const matchWithOptions = [...matches]
    .reverse()
    .find((match) => (match.context as any)?.layoutOptions !== undefined);

  const layoutOptions = matchWithOptions
    ? ((matchWithOptions.context as any)?.layoutOptions as LayoutOptions)
    : undefined;

  const { withPadding = true } = layoutOptions || {};

  const { current } = useAccount();
  const { pathname } = useLocation();
  const { queue } = useTxQueue();
  const [, setAlertOpen] = useState<boolean>(true);

  // Custom hooks for side effects
  usePageTitle();
  useUpdateAIContext();
  useAIFunctionCall();

  // Redirect to welcome if not authenticated
  // Note: This would ideally be in beforeLoad, but we need the useAccount hook
  if (!current) {
    // Use window.location for redirect since we're not in beforeLoad
    if (pathname !== '/welcome') {
      return <Navigate to="/welcome" replace />;
    }

    return null;
  }

  // Sidebar provider styles
  const sidebarProviderStyle = {
    [CSS_VARS.HEADER_HEIGHT]: `${layoutHelpers.getTotalHeaderHeight()}px`,
  } as React.CSSProperties;

  return (
    <>
      {/* Address Modals Provider */}
      <AddressModalsProvider />

      <SidebarProvider
        className="relative flex flex-col [--header-height:calc(--spacing(14))]"
        style={sidebarProviderStyle}
      >
        {/* Top Section: TopBar + Alert */}
        <TopSection current={current} setAlertOpen={setAlertOpen} />

        {/* Main Content */}
        <MainContent withPadding={withPadding} queue={queue} />
      </SidebarProvider>
    </>
  );
}
