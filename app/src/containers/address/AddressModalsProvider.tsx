// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAddressModals } from './useAddressModals';
import { CopyAddressModal, ExplorerAddressModal, QrAddressModal } from '.';

/**
 * Provider component that renders all address-related modals
 * Conditionally shows modals based on application state
 */
export function AddressModalsProvider() {
  const shouldShow = useAddressModals();

  if (!shouldShow) {
    return null;
  }

  return (
    <>
      <CopyAddressModal />
      <QrAddressModal />
      <ExplorerAddressModal />
    </>
  );
}
