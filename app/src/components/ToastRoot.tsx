// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Portal } from '@mui/material';
import { type IconProps, Icons, ToastContainer } from 'react-toastify';
import { injectStyle } from 'react-toastify/dist/inject-style';

import FailedAnimation from './animation/Failed';
import NoticeAnimation from './animation/Notice';
import SuccessAnimation from './animation/Success';

injectStyle();

const icon = (props: IconProps) => {
  if (props.type === 'info') {
    return <NoticeAnimation />;
  }

  if (props.type === 'default') {
    return <NoticeAnimation />;
  }

  if (props.type === 'success') {
    return <SuccessAnimation />;
  }

  if (props.type === 'error') {
    return <FailedAnimation />;
  }

  const Icon = Icons.warning;

  return <Icon {...props} />;
};

function ToastRoot() {
  return (
    <Portal>
      <ToastContainer
        autoClose={5000}
        closeOnClick
        draggable
        hideProgressBar={false}
        icon={icon}
        newestOnTop={false}
        pauseOnFocusLoss
        pauseOnHover
        position='top-right'
        rtl={false}
        theme='light'
      />
    </Portal>
  );
}

export default ToastRoot;
