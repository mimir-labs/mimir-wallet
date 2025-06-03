// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAddressMeta } from '@/accounts/useAddressMeta';
import { toastSuccess } from '@/components/utils';
import { create } from 'zustand';

import { encodeAddress, isPolkadotEvmAddress, sub2Eth, useApi, useNetworks } from '@mimir-wallet/polkadot-core';

import { useCopyClipboard } from './useCopyClipboard';

export const useCopyAddress = create<{
  isOpen: boolean;
  address: string;
  open: (address: string) => void;
  close: () => void;
}>()((set) => ({
  isOpen: false,
  address: '',
  open: (address: { toString: () => string }) => set({ isOpen: true, address: address.toString() }),
  close: () => set({ isOpen: false })
}));

export function useCopyAddressToClipboard(address?: string) {
  const [, copy] = useCopyClipboard();
  const { open: openCopy } = useCopyAddress();
  const { meta } = useAddressMeta(address);
  const { chainSS58 } = useApi();
  const { networks } = useNetworks();

  return (_address: string | undefined = address) => {
    if (!_address) {
      return;
    }

    let encodedAddress: string;

    if (meta.isPure) {
      const network = networks.find((network) => network.genesisHash === meta.pureCreatedAt);

      if (!network) {
        return;
      }

      encodedAddress = encodeAddress(_address, network.ss58Format);
    } else {
      encodedAddress = encodeAddress(_address, chainSS58);
    }

    if (isPolkadotEvmAddress(encodedAddress)) {
      copy(sub2Eth(encodedAddress));
      toastSuccess('Eth Address copied!', sub2Eth(encodedAddress));

      return;
    }

    openCopy(encodedAddress);
    copy(encodedAddress);
    toastSuccess('Address copied!', encodedAddress);
  };
}
