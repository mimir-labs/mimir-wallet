// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, SwipeableDrawer, useMediaQuery, useTheme } from '@mui/material';
import { useContext } from 'react';

import { BaseContainerCtx } from './context';

function RightSideBar({ offsetTop = 0 }: { offsetTop?: number }) {
  const { rightSidebarOpen, closeRightSidebar, openRightSidebar, rightSidebarElement } = useContext(BaseContainerCtx);
  const { breakpoints } = useTheme();
  const downMd = useMediaQuery(breakpoints.down('md'));

  return (
    <>
      {downMd ? (
        <SwipeableDrawer
          PaperProps={{
            sx: {
              width: '50vw',
              maxWidth: 560,
              minWidth: 340,
              paddingX: 1.5,
              paddingY: 2
            }
          }}
          anchor={downMd ? 'right' : 'left'}
          onClose={closeRightSidebar}
          open={rightSidebarOpen}
          variant='temporary'
          onOpen={openRightSidebar}
        >
          <Box sx={{ flex: 1, overflowY: 'auto' }}>{rightSidebarElement}</Box>
        </SwipeableDrawer>
      ) : rightSidebarOpen ? (
        <Box
          sx={{
            position: 'sticky',
            top: offsetTop + 56,
            flex: 'none',
            display: 'flex',
            flexDirection: 'column',
            width: 350,
            height: `calc(100dvh - ${offsetTop}px - 1px - 56px)`,
            bgcolor: 'background.paper',
            borderLeft: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Box sx={{ flex: 1, overflowY: 'auto', paddingX: 1.5, paddingY: 2 }}>{rightSidebarElement}</Box>
        </Box>
      ) : null}
    </>
  );
}

export default RightSideBar;
