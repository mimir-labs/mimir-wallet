// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createPortal } from 'react-dom';

import { Toaster } from '@mimir-wallet/ui';

import FailedAnimation from './animation/Failed';
import NoticeAnimation from './animation/Notice';
import SuccessAnimation from './animation/Success';

function ToastRoot() {
  return createPortal(
    <Toaster
      icons={{
        success: <SuccessAnimation size={30} />,
        error: <FailedAnimation size={30} />,
        info: <NoticeAnimation size={30} />
      }}
      position='top-right'
      theme='light'
      duration={3000}
    />,
    document.body
  );
}

export default ToastRoot;
