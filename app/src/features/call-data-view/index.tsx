// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Call } from '@polkadot/types/interfaces';

import IconClose from '@/assets/svg/icon-close.svg?react';
import { Input } from '@/components';
import JsonView from '@/components/JsonView';
import React, { useEffect, useState } from 'react';

import { useApi } from '@mimir-wallet/polkadot-core';
import { Button } from '@mimir-wallet/ui';

import { decodeCallData } from './utils';

function CallDataViewer({ calldata, onClose }: { calldata: string; onClose: () => void }) {
  const { api } = useApi();
  const [parsedCallData, setParsedCallData] = useState<Call | null>(null);
  const [callDataError, setCallDataError] = useState<Error | null>(null);

  useEffect(() => {
    const [call, error] = decodeCallData(api.registry, calldata);

    setParsedCallData(call);
    setCallDataError(error);
  }, [api.registry, calldata]);

  return (
    <div className='space-y-5'>
      <div className='flex items-center justify-between'>
        <h4>Call Data Details</h4>
        <Button isIconOnly color='primary' variant='ghost' onPress={onClose}>
          <IconClose />
        </Button>
      </div>

      <Input label='Call Data' placeholder='0x...' disabled value={calldata} />

      {callDataError && (
        <div className='bg-secondary rounded-medium p-2.5 break-all'>
          <div
            style={{
              fontFamily: 'Geist Mono'
            }}
            className='text-danger text-tiny'
          >
            {callDataError.message}
          </div>
        </div>
      )}

      {parsedCallData && (
        <div className='rounded-medium bg-secondary p-2.5'>
          <JsonView data={parsedCallData.toHuman()} collapseStringsAfterLength={20} />
        </div>
      )}
    </div>
  );
}

export default React.memo(CallDataViewer);
