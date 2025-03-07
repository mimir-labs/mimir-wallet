// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

import { events } from '@/events';
import CallDataView from '@/features/call-data-view';
import { useMimirLayout } from '@/hooks/useMimirLayout';
import { useEffect } from 'react';

function ViewCallData() {
  const { openRightSidebar, closeRightSidebar } = useMimirLayout();

  useEffect(() => {
    const onView = (callData: HexString) => {
      openRightSidebar(<CallDataView calldata={callData} onClose={closeRightSidebar} />);
    };

    events.on('call_data_view', onView);

    return () => {
      events.off('call_data_view', onView);
    };
  }, [openRightSidebar, closeRightSidebar]);

  return null;
}

export default ViewCallData;
