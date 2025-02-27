// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

import { useEffect } from 'react';

import { events } from '@mimir-wallet/events';
import CallDataView from '@mimir-wallet/features/call-data-view';
import { useMimirLayout } from '@mimir-wallet/hooks/useMimirLayout';

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
