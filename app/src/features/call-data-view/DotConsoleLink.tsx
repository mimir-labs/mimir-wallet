// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { DotConsoleApp, PolkadotJsApp } from '@/config';
import { Link } from 'react-router-dom';

function DotConsoleLink({ network }: { network: string }) {
  const isDotConsoleSupport = DotConsoleApp.supportedChains.includes(network);

  if (!isDotConsoleSupport) {
    const url = PolkadotJsApp.urlSearch?.(network) || new URL(PolkadotJsApp.url);

    url.hash = '#/extrinsics';

    return (
      <Link to={`/explorer/${encodeURIComponent(url.toString())}`} className='hover:underline'>
        Polkadot.js
      </Link>
    );
  }

  const url = DotConsoleApp.urlSearch?.(network) || new URL(DotConsoleApp.url);

  url.pathname = '/extrinsics';

  return (
    <Link to={`/explorer/${encodeURIComponent(url.toString())}`} className='hover:underline'>
      DOT Console
    </Link>
  );
}

export default DotConsoleLink;
