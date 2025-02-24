// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Button, CircularProgress, Grid2 as Grid, Popover, Stack, Typography } from '@mui/material';
import React, { useMemo, useState } from 'react';

import { allEndpoints, groupedEndpoints } from '@mimir-wallet/config';
import { useApi } from '@mimir-wallet/hooks/useApi';

function ChainSelect({ onlyLogo }: { onlyLogo: boolean }) {
  const { isApiReady, network } = useApi();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const endpoint = useMemo(() => allEndpoints.find((item) => item.key === network), [network]);
  const groupEndpoints = useMemo(() => groupedEndpoints(), []);

  return (
    <>
      {onlyLogo ? (
        <Button onClick={handleClick} sx={{ borderColor: 'secondary.main' }} variant='outlined'>
          {isApiReady ? (
            <img alt='' src={endpoint?.icon} style={{ borderRadius: 10 }} width={20} />
          ) : (
            <CircularProgress size={20} />
          )}
        </Button>
      ) : (
        <Button
          onClick={handleClick}
          startIcon={
            isApiReady ? (
              <img alt='' src={endpoint?.icon} style={{ borderRadius: 10 }} width={20} />
            ) : (
              <CircularProgress size={20} />
            )
          }
          sx={{ borderColor: 'secondary.main' }}
          variant='outlined'
        >
          {!isApiReady ? 'Connecting...' : endpoint?.name}
        </Button>
      )}
      <Popover
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        onClose={handleClose}
        open={open}
        slotProps={{
          paper: {
            sx: { width: 600, padding: { sm: 1.5, xs: 1 } }
          }
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
      >
        <Stack spacing={1}>
          {Object.keys(groupEndpoints).map((group) => (
            <Box key={`group-${group}`}>
              <Typography
                variant='h6'
                color='primary.main'
                sx={{ textTransform: 'capitalize', paddingLeft: 1, marginBottom: { sm: 1, xs: 0.5 } }}
              >
                {group}
              </Typography>
              <Grid container columns={{ sm: 3, xs: 2 }} spacing={{ sm: 1, xs: 0.5 }}>
                {groupEndpoints[group].map((endpoint) => (
                  <Grid size={1} key={endpoint.key}>
                    <Button
                      fullWidth
                      sx={{
                        borderRadius: 0.5,
                        justifyContent: 'flex-start',
                        color: 'text.primary',
                        fontWeight: 400,
                        bgcolor: network === endpoint.key ? 'secondary.main' : 'transparent',
                        boxShadow: 'none',
                        textAlign: 'left',
                        paddingX: 1,
                        ':hover,:active': {
                          boxShadow: 'none',
                          bgcolor: 'secondary.main'
                        }
                      }}
                      onClick={() => {
                        window.location.href = `${window.location.origin}?network=${endpoint.key}`;

                        handleClose();
                      }}
                    >
                      <Box component='img' src={endpoint.icon} sx={{ width: 20, borderRadius: 1, marginRight: 1 }} />
                      {endpoint.name}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}
        </Stack>
      </Popover>
    </>
  );
}

export default ChainSelect;
