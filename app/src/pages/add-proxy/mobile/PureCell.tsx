// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import PureIcon from '@/assets/images/pure-icon.svg';

function PureCell() {
  return (
    <div className='w-full border-1 border-transparent'>
      <p className='mb-2.5 font-bold'>Proxied Account</p>
      <div
        className='bg-secondary rounded-medium flex items-center gap-2.5 p-2.5'
        style={{
          height: 56.8,
          fontWeight: 700
        }}
      >
        <img src={PureIcon} />
        Pure Proxy
      </div>
    </div>
  );
}

export default PureCell;
