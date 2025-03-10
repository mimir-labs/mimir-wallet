// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import NullImg from '@/assets/images/Null.png';

function Empty({ height, label }: { label?: string; height: number | string }) {
  return (
    <div className='flex flex-col items-center justify-center gap-5' style={{ height }}>
      <img alt='null' src={NullImg} width={100} />
      <h4>{label || 'No data here.'}</h4>
    </div>
  );
}

export default Empty;
