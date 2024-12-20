// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Button, CircularProgress, Divider, Menu, MenuItem, Typography } from '@mui/material';
import { useMemo, useState } from 'react';

import { findEndpoint, groupedEndpoints } from '@mimir-wallet/config';
import { useApi } from '@mimir-wallet/hooks';

function ChainSelect({ onlyLogo }: { onlyLogo: boolean }) {
  const { genesisHash, isApiConnected, isApiReady } = useApi();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const endpoint = useMemo(() => findEndpoint(genesisHash), [genesisHash]);
  const groupEndpoints = useMemo(() => groupedEndpoints(), []);

  return (
    <>
      {onlyLogo ? (
        <Button onClick={handleClick} sx={{ borderColor: 'secondary.main' }} variant='outlined'>
          {isApiConnected && isApiReady ? (
            <img alt='' src={endpoint?.icon} style={{ borderRadius: 10 }} width={20} />
          ) : (
            <CircularProgress size={20} />
          )}
        </Button>
      ) : (
        <Button
          onClick={handleClick}
          startIcon={
            isApiConnected && isApiReady ? (
              <img alt='' src={endpoint?.icon} style={{ borderRadius: 10 }} width={20} />
            ) : (
              <CircularProgress size={20} />
            )
          }
          sx={{ borderColor: 'secondary.main' }}
          variant='outlined'
        >
          {!isApiConnected || !isApiReady ? 'Connecting...' : endpoint?.name}
        </Button>
      )}
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        onClose={handleClose}
        open={open}
        slotProps={{
          paper: {
            sx: { width: 200 }
          }
        }}
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
                    window.location.href = `${window.location.origin}?network=${endpoint.key}`;

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
