// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SvgIcon } from '@mui/material';
import React from 'react';

import IconCancel from '@mimir-wallet/assets/svg/icon-cancel.svg?react';
import IconSend from '@mimir-wallet/assets/svg/icon-send-fill.svg?react';

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
