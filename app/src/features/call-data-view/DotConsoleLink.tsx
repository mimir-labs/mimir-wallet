// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Link } from '@tanstack/react-router';

import { DotConsoleApp, PolkadotJsApp } from '@/config';

function DotConsoleLink({ network }: { network: string }) {
  const isDotConsoleSupport = DotConsoleApp.supportedChains.includes(network);

  if (!isDotConsoleSupport) {
    const url = PolkadotJsApp.urlSearch?.(network) || new URL(PolkadotJsApp.url);

    url.hash = '#/extrinsics';

    return (
      <Link to='/explorer/$url' params={{ url: url.toString() }} className='hover:underline'>
        Polkadot.js
      </Link>
    );
  }

  const url = DotConsoleApp.urlSearch?.(network) || new URL(DotConsoleApp.url);

  url.pathname = '/extrinsics';

  return (
    <Link to='/explorer/$url' params={{ url: url.toString() }} className='hover:underline'>
      DOT Console
    </Link>
  );
}

export default DotConsoleLink;
