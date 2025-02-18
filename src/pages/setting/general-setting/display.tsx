// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Button, Divider, FormControl, InputLabel, MenuItem, Paper, Select, Stack } from '@mui/material';
import { useState } from 'react';

import { UNIFIED_ADDRESS_FORMAT_KEY } from '@mimir-wallet/constants';
import { useApi } from '@mimir-wallet/hooks/useApi';
import { store } from '@mimir-wallet/utils';

function DisplaySetting() {
  const { chain } = useApi();
  const [addressFormat, setAddressFormat] = useState<string>(
    chain.relayChainSs58Format !== undefined
      ? (store.get(UNIFIED_ADDRESS_FORMAT_KEY) as string | undefined) || 'original'
      : 'original'
  ); // unified, original

  const handleSave = () => {
    if (chain.relayChainSs58Format !== undefined) {
      store.set(UNIFIED_ADDRESS_FORMAT_KEY, addressFormat);
      useApi.setState({
        chainSS58: addressFormat === 'unified' ? (chain.relayChainSs58Format ?? chain.ss58Format) : chain.ss58Format
      });
    }
  };

  return (
    <Paper component={Stack} sx={{ padding: 2, borderRadius: 2 }} spacing={2}>
      <FormControl fullWidth>
        <InputLabel>Address Format</InputLabel>
        <Select<string>
          variant='outlined'
          onChange={(e) => setAddressFormat(e.target.value)}
          value={addressFormat}
          disabled={chain.relayChainSs58Format === undefined}
        >
          <MenuItem value='unified'>Unified Format (Prefix: {chain.relayChainSs58Format ?? chain.ss58Format})</MenuItem>
          <MenuItem value='original'>Original Format (Prefix: {chain.ss58Format})</MenuItem>
        </Select>
      </FormControl>

      <Divider />

      <Button disabled={chain.relayChainSs58Format === undefined} fullWidth onClick={handleSave}>
        Save
      </Button>
    </Paper>
  );
}

export default DisplaySetting;
