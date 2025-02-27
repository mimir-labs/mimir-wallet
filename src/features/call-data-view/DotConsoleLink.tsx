// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import { DotConsoleApp, PolkadotJsApp } from '@mimir-wallet/config';

function DotConsoleLink({ network }: { network: string }) {
  const isDotConsoleSupport = DotConsoleApp.supportedChains.includes(network);

  if (!isDotConsoleSupport) {
    const url = PolkadotJsApp.urlSearch(network);

    url.hash = `#/extrinsics`;

    return (
      <Link component={RouterLink} underline='hover' to={`/explorer/${encodeURIComponent(url.toString())}`}>
        Polkadot.js
      </Link>
    );
  }

  const url = DotConsoleApp.urlSearch(network);

  url.pathname = '/extrinsics';

  return (
    <Link component={RouterLink} underline='hover' to={`/explorer/${encodeURIComponent(url.toString())}`}>
      DOT Console
    </Link>
  );
}

export default DotConsoleLink;
