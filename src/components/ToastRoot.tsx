// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Portal } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import { injectStyle } from 'react-toastify/dist/inject-style';

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
      <ToastContainer autoClose={5000} closeOnClick draggable hideProgressBar={false} newestOnTop={false} pauseOnFocusLoss pauseOnHover position='top-right' rtl={false} theme='light' />
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
