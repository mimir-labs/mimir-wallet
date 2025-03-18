// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Call } from '@polkadot/types/interfaces';
import type { HexString } from '@polkadot/util/types';

import IconArrowLeft from '@/assets/svg/icon-arrow-left.svg?react';
import { Input } from '@/components';
import JsonView from '@/components/JsonView';
import { useInput } from '@/hooks/useInput';
import { Box, Button, Divider, IconButton, Stack, SvgIcon, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

import { useApi } from '@mimir-wallet/polkadot-core';

import DotConsoleButton from '../call-data-view/DotConsoleButton';
import DotConsoleLink from '../call-data-view/DotConsoleLink';
import { decodeCallData } from '../call-data-view/utils';
import { useSavedTemplate } from './useSavedTemplate';

function AddTemplate({
  isView = false,
  onBack,
  defaultCallData,
  defaultName
}: {
  isView?: boolean;
  defaultCallData?: HexString;
  defaultName?: string;
  onBack: () => void;
}) {
  const { network, api } = useApi();
  const { addTemplate } = useSavedTemplate(network);
  const [name, setName] = useInput(defaultName || '');
  const [callData, setCallData] = useInput(defaultCallData || '');
  const [parsedCallData, setParsedCallData] = useState<Call | null>(null);
  const [callDataError, setCallDataError] = useState<Error | null>(null);

  useEffect(() => {
    const [call, error] = decodeCallData(api.registry, callData);

    setParsedCallData(call);
    setCallDataError(error);
  }, [api.registry, callData]);

  const onAdd = () => {
    if (!(name && callData) || !!callDataError || !parsedCallData) return;
    parsedCallData.data;

    addTemplate({ name, call: parsedCallData.toHex() });

    onBack();
  };

  return (
    <Stack spacing={2}>
      <Box display='flex' gap={0.5} alignItems='center'>
        <IconButton color='inherit' onClick={onBack}>
          <SvgIcon inheritViewBox component={IconArrowLeft} />
        </IconButton>
        <Typography variant='h4'>{isView ? 'View Template' : 'Add New Template'}</Typography>
      </Box>

      <Divider />

      <Input disabled={isView} label='Name' value={name} onChange={setName} />

      <Input
        label='Call Data'
        placeholder='0x...'
        helper={
          isView ? null : (
            <Box color='text.primary'>
              You can edit it in the <DotConsoleLink network={network} /> and then click Import or directly paste the
              Encoded Call Data.
            </Box>
          )
        }
        value={callData}
        onChange={setCallData}
      />

      {callDataError && (
        <Box
          sx={{
            bgcolor: 'secondary.main',
            padding: 1,
            borderRadius: 1,
            wordBreak: 'break-all'
          }}
        >
          <Typography fontFamily='Geist Mono' color='error' fontSize='0.75rem'>
            {callDataError.message}
          </Typography>
        </Box>
      )}

      {parsedCallData && (
        <Box sx={{ borderRadius: 1, bgcolor: 'secondary.main', padding: 1 }}>
          <JsonView data={parsedCallData.toHuman()} collapseStringsAfterLength={20} />
        </Box>
      )}

      {isView ? (
        <DotConsoleButton call={callData} network={network} />
      ) : (
        <Button variant='contained' color='primary' disabled={!(name && callData) || !!callDataError} onClick={onAdd}>
          Add
        </Button>
      )}
    </Stack>
  );
}

export default AddTemplate;
