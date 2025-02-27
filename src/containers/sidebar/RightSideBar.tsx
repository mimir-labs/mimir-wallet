// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Drawer, useMediaQuery, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';

import { useMimirLayout } from '@mimir-wallet/hooks/useMimirLayout';

function RightSideBar({ offsetTop = 0 }: { offsetTop?: number }) {
  const { rightSidebarOpen, closeRightSidebar, rightSidebarElement } = useMimirLayout();
  const { breakpoints } = useTheme();
  const downMd = useMediaQuery(breakpoints.down('md'));
  const [isOpen, setIsOpen] = useState(rightSidebarOpen);
  const [isOpenDelay, setIsOpenDelay] = useState(rightSidebarOpen);

  useEffect(() => {
    if (!rightSidebarOpen) {
      setIsOpen(rightSidebarOpen);
      setTimeout(() => {
        setIsOpenDelay(rightSidebarOpen);
      }, 150);
    } else {
      setIsOpenDelay(rightSidebarOpen);
      setTimeout(() => {
        setIsOpen(rightSidebarOpen);
      }, 30);
    }
  }, [rightSidebarOpen]);

  return (
    <>
      {downMd ? (
        <Drawer
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
          open={isOpen}
          variant='temporary'
        >
          <Box sx={{ flex: 1, overflowY: 'auto' }}>{rightSidebarElement}</Box>
        </Drawer>
      ) : (
        <Box
          sx={{
            position: 'sticky',
            top: offsetTop + 56,
            flex: 'none',
            display: isOpenDelay ? 'flex' : 'none',
            flexDirection: 'column',
            width: 350,
            marginRight: isOpen ? 0 : '-350px',
            height: `calc(100dvh - ${offsetTop}px - 1px - 56px)`,
            bgcolor: 'background.paper',
            borderLeft: '1px solid',
            borderColor: 'divider',
            transition: 'margin-right 0.15s ease-in-out'
          }}
        >
          <Box sx={{ flex: 1, overflowY: 'auto', paddingX: 1.5, paddingY: 2, paddingBottom: 7 }}>
            {rightSidebarElement}
          </Box>
        </Box>
      )}
    </>
  );
}

export default RightSideBar;
