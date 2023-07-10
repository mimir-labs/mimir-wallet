// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Button, Menu, MenuItem, MenuList, Typography } from '@mui/material';
import { useState } from 'react';

import { appConfig, endpoints } from '@mimirdev/app-config';
import { ArrowDown } from '@mimirdev/app-config/icons';
import { useApi } from '@mimirdev/react-hooks';

import ChainInfo from './ChainInfo';

function ChainSelect() {
  const { isApiReady } = useApi();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (url: string, server: string) => {
    handleClose();
    appConfig.setUrl(url, server);
  };

  return (
    <>
      <Button
        aria-controls={open ? 'chain-select-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup='true'
        color='secondary'
        endIcon={<ArrowDown sx={{ fontSize: '0.6em !important' }} />}
        id='chain-select-button'
        onClick={handleClick}
        sx={{ color: 'text.primary', borderColor: 'secondary.main' }}
        variant='outlined'
      >
        {isApiReady ? <ChainInfo /> : 'Initializing connection'}
      </Button>
      <Menu PaperProps={{ sx: { paddingX: 1 } }} anchorEl={anchorEl} aria-labelledby='chain-select-button' autoFocus={false} id='chain-select-menu' onClose={handleClose} open={open}>
        {endpoints.map((endpoint, index) => (
          <MenuList key={index}>
            <Typography key={`${index}-title`}>{endpoint.logo ?? endpoint.text}</Typography>
            {Object.entries(endpoint.providers).map(([name, value]) => (
              <MenuItem key={name} onClick={() => handleSelect(value, endpoint.server)}>
                {name}
              </MenuItem>
            ))}
          </MenuList>
        ))}
        <MenuItem key='local' onClick={() => handleSelect('ws://127.0.0.1:9944/', 'http://localhost:8080/')}>
          Local
        </MenuItem>
      </Menu>
    </>
  );
}

export default ChainSelect;
