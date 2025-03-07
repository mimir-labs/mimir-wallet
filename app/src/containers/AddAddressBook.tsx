// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AddAddressDialog } from '@/components';
import { useAddressStore } from '@/hooks/useAddressStore';

function AddAddressBook() {
  const { addAddressDialog } = useAddressStore();

  return (
    <AddAddressDialog
      defaultAddress={addAddressDialog.defaultAddress}
      open={addAddressDialog.open}
      onClose={() => {
        addAddressDialog?.onClose?.();
        useAddressStore.setState({ addAddressDialog: { open: false } });
      }}
      watchlist={addAddressDialog.watchlist}
      onAdded={addAddressDialog.onAdded}
    />
  );
}

export default AddAddressBook;
