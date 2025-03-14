// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { DotConsoleApp, PolkadotJsApp } from '@/config';

import { Button, Link } from '@mimir-wallet/ui';

function DotConsoleButton({ call, network }: { call: string; network: string }) {
  const isDotConsoleSupport = DotConsoleApp.supportedChains.includes(network);

  if (!isDotConsoleSupport) {
    const url = PolkadotJsApp.urlSearch(network);

    url.hash = `#/extrinsics/decode/${call}`;

    return (
      <Button fullWidth as={Link} href={`/explorer/${encodeURIComponent(url.toString())}`}>
        View In Polkadot.js
      </Button>
    );
  }

  const url = DotConsoleApp.urlSearch(network);

  url.pathname = '/extrinsics';
  url.searchParams.set('callData', call);

  return (
    <Button fullWidth as={Link} href={`/explorer/${encodeURIComponent(url.toString())}`}>
      View In DOTConsole
    </Button>
  );
}

export default DotConsoleButton;
