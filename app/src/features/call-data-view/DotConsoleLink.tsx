// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { DotConsoleApp, PolkadotJsApp } from '@/config';

import { Link } from '@mimir-wallet/ui';

function DotConsoleLink({ network }: { network: string }) {
  const isDotConsoleSupport = DotConsoleApp.supportedChains.includes(network);

  if (!isDotConsoleSupport) {
    const url = PolkadotJsApp.urlSearch(network);

    url.hash = '#/extrinsics';

    return (
      <Link underline='hover' href={`/explorer/${encodeURIComponent(url.toString())}`}>
        Polkadot.js
      </Link>
    );
  }

  const url = DotConsoleApp.urlSearch(network);

  url.pathname = '/extrinsics';

  return (
    <Link underline='hover' href={`/explorer/${encodeURIComponent(url.toString())}`}>
      DOT Console
    </Link>
  );
}

export default DotConsoleLink;
