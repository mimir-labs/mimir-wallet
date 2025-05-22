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

export function toastSuccess(message: any, description?: React.ReactNode) {
  return toast.success(
    description ? (
      <div className='flex flex-col gap-1'>
        <b>{message}</b>
        <span className='text-tiny'>{description}</span>
      </div>
    ) : (
      <div className='flex items-center min-h-[30px]'>{message}</div>
    )
  );
}

export function toastError(error: any) {
  return toast.error(<div className='flex items-center min-h-[30px]'>{getMessage(error)}</div>);
}

export function toastWarn(error: any) {
  return toast.warn(<div className='flex items-center min-h-[30px]'>{getMessage(error)}</div>);
}
