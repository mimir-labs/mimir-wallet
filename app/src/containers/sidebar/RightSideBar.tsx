// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useMimirLayout } from '@/hooks/useMimirLayout';
import { useEffect, useState } from 'react';

import { Drawer, DrawerContent } from '@mimir-wallet/ui';

function RightSideBar({ offsetTop = 0 }: { offsetTop?: number }) {
  const { rightSidebarOpen, closeRightSidebar, rightSidebarElement } = useMimirLayout();
  const upMd = useMediaQuery('md');
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
      {!upMd ? (
        <Drawer direction='right' onClose={closeRightSidebar} open={rightSidebarOpen}>
          <DrawerContent className='w-auto max-w-full p-5'>{rightSidebarElement}</DrawerContent>
        </Drawer>
      ) : (
        <div
          className='bg-content1 border-l-secondary border-l-1 transition-[margin-right] duration-150 ease-in-out'
          style={{
            position: 'sticky',
            top: offsetTop + 56,
            flex: 'none',
            display: isOpenDelay ? 'flex' : 'none',
            flexDirection: 'column',
            width: 350,
            marginRight: isOpen ? 0 : '-350px',
            height: `calc(100dvh - ${offsetTop}px - 1px - 56px)`
          }}
        >
          <div className='flex-1 overflow-y-auto px-4 py-5 pb-[70px]'>{rightSidebarElement}</div>
        </div>
      )}
    </>
  );
}

export default RightSideBar;
