// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Portal } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import { injectStyle } from 'react-toastify/dist/inject-style';

import { FailedAnimation, NoticeAnimation, SuccessAnimation, WaitingAnimation } from './animation';
import TxError from './TxError';

injectStyle();

function getMessage(value: unknown): React.ReactNode {
  if (typeof value === 'string') {
    return value.toString();
  } else {
    return <TxError error={value} />;
  }
}

function ToastRoot() {
  return (
    <Portal>
      <ToastContainer
        autoClose={5000}
        closeOnClick
        draggable
        hideProgressBar={false}
        icon={(props) => {
          if (props.type === 'info') {
            return <NoticeAnimation />;
          } else if (props.type === 'default') {
            return <NoticeAnimation />;
          } else if (props.type === 'success') {
            return <SuccessAnimation />;
          } else if (props.type === 'error') {
            return <FailedAnimation />;
          } else {
            return <WaitingAnimation />;
          }
        }}
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

export function toastSuccess(message: string) {
  return toast.success(message);
}

export function toastError(error: any) {
  return toast.error(getMessage(error));
}

export function toastWarn(error: any) {
  return toast.warn(getMessage(error));
}

export default ToastRoot;
