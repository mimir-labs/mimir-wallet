// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Portal } from '@mui/material';
import { useCallback, useState } from 'react';
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

export function useToastPromise<T extends (...args: any) => Promise<any>, Args extends any[] = Parameters<T>, R extends Promise<any> = ReturnType<T>>(
  callback: T,
  { pending, success }: { pending?: string; success?: string } = {}
): [loading: boolean, fn: (...args: Args) => R] {
  const [loading, setLoading] = useState(false);

  const fn = useCallback(
    async (...args: Args): Promise<any> => {
      setLoading(true);

      try {
        // eslint-disable-next-line n/no-callback-literal
        const promise = callback(...args);

        const data = await toast.promise(promise, {
          pending: pending || 'Pending...',
          success: success || 'Success!',
          error: {
            render: ({ data }) => {
              return <TxError error={data} />;
            }
          }
        });

        return data;
      } catch {
      } finally {
        setLoading(false);
      }
    },
    [callback, pending, success]
  );

  return [loading, fn as (...args: Args) => R];
}

export default ToastRoot;
