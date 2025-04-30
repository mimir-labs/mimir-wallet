// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';
import type { AccountData } from './types';

import { HIDE_ACCOUNT_HEX_KEY } from '@/constants';
import { create } from 'zustand';

import { store } from '@mimir-wallet/service';

export interface AddressState {
  accounts: AccountData[];
  current?: string | undefined;
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
  switchAddress: undefined
}));
