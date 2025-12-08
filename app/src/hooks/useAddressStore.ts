// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountData } from './types';
import type { HexString } from '@polkadot/util/types';

import { store } from '@mimir-wallet/service';
import { create } from 'zustand';

import { HIDE_ACCOUNT_HEX_KEY } from '@/constants';

export interface AddressState {
  accounts: AccountData[];
  hideAccountHex: HexString[];
  addresses: { address: string; name: string; watchlist?: boolean }[];
  isMultisigSyned: boolean;
  addAddressDialog: {
    defaultAddress?: string;
    watchlist?: boolean;
    open: boolean;
    onAdded?: (address: string) => void;
    onClose?: () => void;
  };
  switchAddress?: string;
}

export const useAddressStore = create<AddressState>()(() => ({
  accounts: [],
  hideAccountHex: (store.get(HIDE_ACCOUNT_HEX_KEY) as HexString[]) || [],
  addresses: [],
  isMultisigSyned: false,
  addAddressDialog: { open: false },
  switchAddress: undefined,
}));
