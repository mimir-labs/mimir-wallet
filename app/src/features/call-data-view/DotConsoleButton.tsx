// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Button, type ButtonProps } from '@mimir-wallet/ui';
import { Link } from '@tanstack/react-router';

import { DotConsoleApp, PolkadotJsApp } from '@/config';

function DotConsoleButton({ call, network, ...props }: { call: string; network: string } & ButtonProps) {
  const isDotConsoleSupport = DotConsoleApp.supportedChains.includes(network);

  if (!isDotConsoleSupport) {
    const url = PolkadotJsApp.urlSearch?.(network) || new URL(PolkadotJsApp.url);

    url.hash = `#/extrinsics/decode/${call}`;

    return (
      <Button fullWidth asChild>
        <Link to='/explorer/$url' params={{ url: url.toString() }}>
          View In Polkadot.js
        </Link>
      </Button>
    );
  }

  const url = DotConsoleApp.urlSearch?.(network) || new URL(DotConsoleApp.url);

  url.pathname = '/extrinsics';
  url.searchParams.set('callData', call);

  return (
    <Button fullWidth asChild {...props}>
      <Link to='/explorer/$url' params={{ url: url.toString() }}>
        View In DOTConsole
      </Link>
    </Button>
  );
}

export default DotConsoleButton;
