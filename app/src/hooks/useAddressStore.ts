// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';
import type { AccountData, AccountDataExtra, AddressMeta } from './types';

import { HIDE_ACCOUNT_PREFIX } from '@/constants';
import { store } from '@/utils';
import { create } from 'zustand';

export interface AddressState {
  accounts: (AccountDataExtra & AccountData)[];
  current?: string | undefined;
  hideAccountHex: HexString[];
  addresses: { address: string; name: string; networks: string[]; watchlist?: boolean }[];
  isMultisigSyned: boolean;
  addAddressDialog: {
    defaultAddress?: string;
    watchlist?: boolean;
    open: boolean;
    onAdded?: (address: string) => void;
    onClose?: () => void;
  };
  switchAddress?: string;
  metas: Record<string, AddressMeta>;
}

export const useAddressStore = create<AddressState>()(() => ({
  accounts: [],
  hideAccountHex: (store.get(HIDE_ACCOUNT_PREFIX) as HexString[]) || [],
  addresses: [],
  isMultisigSyned: false,
  addAddressDialog: { open: false },
  switchAddress: undefined,
  metas: {}
}));
