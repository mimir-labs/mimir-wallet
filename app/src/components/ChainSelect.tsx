// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { allEndpoints, groupedEndpoints } from '@/config';
import { useApi } from '@/hooks/useApi';
import { Box, Popover } from '@mui/material';
import { useMemo, useState } from 'react';

import { Button, ScrollShadow, Spinner } from '@mimir-wallet/ui';

function ChainSelect({ onlyLogo }: { onlyLogo: boolean }) {
  const { isApiReady, network } = useApi();
  const [anchorEl, setAnchorEl] = useState<null | Element>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: { target: Element }) => {
    setAnchorEl(event.target);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const endpoint = useMemo(() => allEndpoints.find((item) => item.key === network), [network]);
  const groupEndpoints = useMemo(() => groupedEndpoints(), []);

  return (
    <>
      {onlyLogo ? (
        <Button onPress={handleClick} color='primary' className='border-secondary' variant='bordered'>
          {isApiReady ? (
            <img alt='' src={endpoint?.icon} style={{ borderRadius: 10 }} width={20} />
          ) : (
            <Spinner size='sm' />
          )}
        </Button>
      ) : (
        <Button
          onPress={handleClick}
          startContent={
            isApiReady ? (
              <img alt='' src={endpoint?.icon} style={{ borderRadius: 10 }} width={20} />
            ) : (
              <Spinner size='sm' />
            )
          }
          color='primary'
          variant='bordered'
          className='border-secondary font-bold'
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
        <ScrollShadow className='max-h-[80dvh] scrollbar-hide'>
          <div className='space-y-2.5'>
            {Object.keys(groupEndpoints).map((group) => (
              <Box key={`group-${group}`}>
                <h6 color='primary.main' className='text-primary capitalize pl-2.5 mb-[5px] sm:mb-2.5'>
                  {group}
                </h6>
                <div className='grid grid-cols-2 sm:grid-cols-3 gap-[5px] sm:gap-2.5'>
                  {groupEndpoints[group].map((endpoint) => (
                    <Button
                      key={endpoint.key}
                      fullWidth
                      variant='light'
                      radius='sm'
                      color='secondary'
                      data-selected={network === endpoint.key}
                      className='justify-start text-foreground font-normal shadow-none text-left px-2.5 data-[selected=true]:bg-secondary data-[hover=true]:bg-secondary'
                      onPress={() => {
                        window.location.href = `${window.location.origin}?network=${endpoint.key}`;

                        handleClose();
                      }}
                    >
                      <Box component='img' src={endpoint.icon} sx={{ width: 20, borderRadius: 1, marginRight: 1 }} />
                      {endpoint.name}
                    </Button>
                  ))}
                </div>
              </Box>
            ))}
          </div>
        </ScrollShadow>
      </Popover>
    </>
  );
}

export default ChainSelect;
