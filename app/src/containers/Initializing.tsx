// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { MimirLoading } from '@/components';
import { useEffect, useState } from 'react';

import { Link } from '@mimir-wallet/ui';

function Initializing() {
  const [showCustomize, setShowCustomize] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setShowCustomize(true);
    }, 3000);
  }, []);

  return (
    <div
      style={{
        background: 'linear-gradient(245deg, #F4F2FF 0%, #FBFDFF 100%)',
        position: 'absolute',
        left: 0,
        right: 0,
        top: 56,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <MimirLoading />
      {showCustomize && <Link href='/setting'>Go to Customize RPC</Link>}
    </div>
  );
}

export default Initializing;
