// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { API_URL_KEY, findEndpoint, groupedEndpoints } from '@mimir-wallet/config';
import { useApi } from '@mimir-wallet/hooks';
import { LoadingButton } from '@mui/lab';
import { Box, Divider, Menu, MenuItem, Typography } from '@mui/material';
import { useMemo, useState } from 'react';

function ChainSelect() {
  const { api, isApiReady } = useApi();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const endpoint = useMemo(() => (isApiReady ? findEndpoint(api.genesisHash.toHex()) : undefined), [api, isApiReady]);
  const groupEndpoints = useMemo(() => groupedEndpoints(), []);

  return (
    <>
      <LoadingButton
        loading={!isApiReady}
        onClick={handleClick}
        startIcon={<img src={endpoint?.icon} style={{ borderRadius: 10 }} width={20} />}
        sx={{ borderColor: 'secondary.main' }}
        variant='outlined'
      >
        {!isApiReady ? 'Connecting...' : endpoint?.name}
      </LoadingButton>
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        onClose={handleClose}
        open={open}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
      >
        {Object.keys(groupEndpoints).map((group, index) => {
          return (
            <Box key={`group-${group}`}>
              {index > 0 && <Divider sx={{ my: 0.5 }} />}
              <Typography color='primary.main' sx={{ textTransform: 'capitalize', paddingLeft: 1 }}>
                {group}
              </Typography>
              {groupEndpoints[group].map((endpoint, index) => (
                <MenuItem
                  disableRipple
                  key={endpoint.genesisHash || index}
                  onClick={() => {
                    if (api.genesisHash.toHex() !== endpoint.genesisHash) {
                      localStorage.setItem(API_URL_KEY, endpoint.wsUrl);
                      window.location.reload();
                    }

                    handleClose();
                  }}
                >
                  <Box component='img' src={endpoint.icon} sx={{ width: 20, borderRadius: 1, marginRight: 1 }} />
                  {endpoint.name}
                </MenuItem>
              ))}
            </Box>
          );
        })}
      </Menu>
    </>
  );
}

export default ChainSelect;
