// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

import Batch from '@/apps/batch';
import { events } from '@/events';
import CallDataView, { type CallDataViewRef } from '@/features/call-data-view';
import Template, { type TemplateRef } from '@/features/template';
import { useMimirLayout } from '@/hooks/useMimirLayout';
import { useRefControl } from '@/hooks/useRefControl';
import { useCallback, useEffect } from 'react';

import { Sidebar, SidebarContent, SidebarHeader, Tab, Tabs } from '@mimir-wallet/ui';

import { layoutHelpers } from '../constants';

function RightSideBar() {
  const { rightSidebarOpen, openRightSidebar, closeRightSidebar, rightSidebarState, setRightSidebarTab } =
    useMimirLayout();

  const { ref: templateRef, callMethod: callTemplate } = useRefControl<TemplateRef>();
  const { ref: callDataViewRef, callMethod: callDataView } = useRefControl<CallDataViewRef>();

  const sidebarWidth = layoutHelpers.getRightSidebarWidth(rightSidebarState.tab);

  // Stable event handlers using useCallback
  const handleTemplateOpen = useCallback(
    (eventNetwork: string) => {
      // Open right sidebar and switch to template tab
      openRightSidebar();
      setRightSidebarTab('template');
      // Use enhanced ref control
      callTemplate('setNetwork', eventNetwork);
      callTemplate('showList');
    },
    [openRightSidebar, setRightSidebarTab, callTemplate]
  );

  const handleTemplateAdd = useCallback(
    (eventNetwork: string, callData: HexString) => {
      // Open right sidebar and switch to template tab
      openRightSidebar();
      setRightSidebarTab('template');
      // Use enhanced ref control
      callTemplate('setNetwork', eventNetwork);
      callTemplate('showAdd', callData);
    },
    [openRightSidebar, setRightSidebarTab, callTemplate]
  );

  const handleCallDataView = useCallback(
    (eventNetwork: string, callData: HexString) => {
      // Open right sidebar and switch to decoder tab
      openRightSidebar();
      setRightSidebarTab('decoder');
      // Use enhanced ref control
      callDataView('setNetwork', eventNetwork);
      callDataView('setCallData', callData);
    },
    [openRightSidebar, setRightSidebarTab, callDataView]
  );

  // Register event listeners with stable handlers
  useEffect(() => {
    events.on('template_open', handleTemplateOpen);
    events.on('template_add', handleTemplateAdd);
    events.on('call_data_view', handleCallDataView);

    return () => {
      events.off('template_open', handleTemplateOpen);
      events.off('template_add', handleTemplateAdd);
      events.off('call_data_view', handleCallDataView);
    };
  }, [handleTemplateOpen, handleTemplateAdd, handleCallDataView]);

  return (
    <Sidebar
      side='right'
      open={rightSidebarOpen}
      onOpenChange={(state) => (state ? openRightSidebar() : closeRightSidebar())}
      className='top-(--header-height) h-[calc(100svh-var(--header-height))]!'
      sideBarWidth={sidebarWidth}
    >
      <SidebarHeader className='px-4'>
        <Tabs
          color='primary'
          variant='underlined'
          classNames={{
            tabList: 'px-0',
            panel: 'hidden'
          }}
          selectedKey={rightSidebarState.tab}
          onSelectionChange={(key) => setRightSidebarTab(key.toString() as any)}
        >
          <Tab key='batch' title='Batch' />
          <Tab key='template' title='Template' />
          <Tab key='decoder' title='Decoder' />
        </Tabs>
      </SidebarHeader>

      <SidebarContent className='px-4 pb-4'>
        {rightSidebarState.tab === 'batch' ? <Batch /> : null}
        {rightSidebarState.tab === 'template' ? <Template ref={templateRef} /> : null}
        {rightSidebarState.tab === 'decoder' ? <CallDataView ref={callDataViewRef} /> : null}
      </SidebarContent>
    </Sidebar>
  );
}

export default RightSideBar;
