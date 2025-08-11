// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Call } from '@polkadot/types/interfaces';
import type { Registry } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';

import IconArrowLeft from '@/assets/svg/icon-arrow-left.svg?react';
import { Input, InputNetwork } from '@/components';
import JsonView from '@/components/JsonView';
import { useInput } from '@/hooks/useInput';
import { useEffect, useState } from 'react';

import { useApi } from '@mimir-wallet/polkadot-core';
import { Button, Divider } from '@mimir-wallet/ui';

import DotConsoleButton from '../call-data-view/DotConsoleButton';
import DotConsoleLink from '../call-data-view/DotConsoleLink';
import { decodeCallData } from '../call-data-view/utils';
import { useSavedTemplate } from './useSavedTemplate';

function AddTemplate({
  isView = false,
  registry,
  onBack,
  defaultCallData,
  defaultName,
  setNetwork
}: {
  isView?: boolean;
  defaultCallData?: HexString;
  defaultName?: string;
  registry: Registry;
  onBack: () => void;
  setNetwork?: (network: string) => void;
}) {
  const { network } = useApi();
  const { addTemplate } = useSavedTemplate(network);
  const [name, setName] = useInput(defaultName || '');
  const [callData, setCallData] = useInput(defaultCallData || '');
  const [parsedCallData, setParsedCallData] = useState<Call | null>(null);
  const [callDataError, setCallDataError] = useState<Error | null>(null);

  useEffect(() => {
    const [call, error] = decodeCallData(registry, callData);

    setParsedCallData(call);
    setCallDataError(error);
  }, [registry, callData]);

  const onAdd = () => {
    if (!(name && callData) || !!callDataError || !parsedCallData) return;
    parsedCallData.data;

    addTemplate({ name, call: parsedCallData.toHex() });

    onBack();
  };

  return (
    <div className='space-y-5'>
      <div className='flex items-center gap-1'>
        <Button isIconOnly color='primary' variant='light' onClick={onBack}>
          <IconArrowLeft />
        </Button>
        <h4>{isView ? 'View Template' : 'Add New Template'}</h4>
      </div>

      {setNetwork && <InputNetwork network={network} setNetwork={setNetwork} />}

      <Divider />

      <Input disabled={isView} label='Name' value={name} onChange={setName} />

      <Input
        label='Call Data'
        placeholder='0x...'
        helper={
          isView ? null : (
            <div className='text-foreground/50'>
              You can edit it in the <DotConsoleLink network={network} /> and then click Import or directly paste the
              Encoded Call Data.
            </div>
          )
        }
        value={callData}
        onChange={setCallData}
      />

      {callDataError && (
        <div className='bg-secondary rounded-[10px] p-2.5 break-all'>
          <p style={{ fontFamily: 'Geist Mono' }} className='text-danger text-xs'>
            {callDataError.message}
          </p>
        </div>
      )}

      {parsedCallData && (
        <div className='bg-secondary rounded-[10px] p-2.5'>
          <JsonView data={parsedCallData.toHuman()} collapseStringsAfterLength={20} />
        </div>
      )}

      {isView ? (
        <DotConsoleButton call={callData} network={network} />
      ) : (
        <Button
          fullWidth
          variant='solid'
          color='primary'
          disabled={!(name && callData) || !!callDataError}
          onClick={onAdd}
        >
          Add
        </Button>
      )}
    </div>
  );
}

export default AddTemplate;
