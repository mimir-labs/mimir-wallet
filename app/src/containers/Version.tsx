// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Link } from '@mimir-wallet/ui';

function Version() {
  return (
    <div className='z-0 flex items-center gap-5'>
      <span>Version: {import.meta.env.VERSION}</span>
      <Link color='primary' href='https://github.com/mimir-labs/mimir-wallet' isExternal>
        Github
      </Link>
      <Link color='primary' href='https://t.me/+t7vZ1kXV5h1kNGQ9' isExternal>
        Report Bug
      </Link>
      <Link color='primary' href='https://docs.mimir.global' isExternal>
        Docs
      </Link>
    </div>
  );
}

export default Version;
