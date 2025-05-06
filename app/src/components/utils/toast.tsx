// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { toast } from 'react-toastify';

import TxError from '../TxError';

function getMessage(value: unknown): React.ReactNode {
  if (typeof value === 'string') {
    return value.toString();
  }

  return <TxError error={value} />;
}

export function toastSuccess(message: any, description?: string) {
  return toast.success(
    description ? (
      <div className='flex flex-col gap-1'>
        <b>{message}</b>
        {description}
      </div>
    ) : (
      message
    ),
    {
      autoClose: 1000000
    }
  );
}

export function toastError(error: any) {
  return toast.error(getMessage(error));
}

export function toastWarn(error: any) {
  return toast.warn(getMessage(error));
}
