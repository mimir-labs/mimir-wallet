// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ReactComponent as IconCancel } from '@mimir-wallet/assets/svg/icon-cancel.svg';
import { ReactComponent as IconSend } from '@mimir-wallet/assets/svg/icon-send-fill.svg';
import { SvgIcon } from '@mui/material';
import React from 'react';

function ActionText({ action }: { action: string }) {
  let comp: React.ReactNode;

  if (['balances.transfer', 'balances.transferKeepAlive', 'balances.transferAllowDeath'].includes(action)) {
    comp = (
      <>
        <SvgIcon color='primary' component={IconSend} inheritViewBox />
        Transfer
      </>
    );
  } else if (['multisig.cancelAsMulti'].includes(action)) {
    comp = (
      <>
        <SvgIcon color='error' component={IconCancel} inheritViewBox />
        Cancel
      </>
    );
  } else {
    comp = action;
  }

  return comp;
}

export default React.memo(ActionText);
