// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import Fearless from '@/assets/images/fearless.svg';
import FearlessDisabled from '@/assets/images/fearless-disabled.svg';
import Nova from '@/assets/images/nova.svg';
import NovaDisabled from '@/assets/images/nova-disabled.svg';
import Plutonication from '@/assets/images/plutonication.webp';
import PolkadotJs from '@/assets/images/polkadotjs.svg';
import PolkadotJsDisabled from '@/assets/images/polkadotjs-disabled.svg';
import Polkagate from '@/assets/images/polkagate.webp';
import PolkagateDisabled from '@/assets/images/polkagate-disabled.webp';
import Subwallet from '@/assets/images/subwallet.webp';
import SubwalletDisabled from '@/assets/images/subwallet-disabled.svg';
import Talisman from '@/assets/images/talisman.svg';
import TalismanDisabled from '@/assets/images/talisman-disabled.svg';

export type WalletConfig = {
  key: string;
  icon: string;
  disabledIcon: string;
  name: string;
  downloadUrl: string;
};

export const walletConfig: Record<string, WalletConfig> = {
  nova: {
    key: 'polkadot-js',
    icon: Nova,
    disabledIcon: NovaDisabled,
    name: 'Nova',
    downloadUrl: 'https://novawallet.io/'
  },
  'subwallet-js': {
    key: 'subwallet-js',
    icon: Subwallet,
    disabledIcon: SubwalletDisabled,
    name: 'SubWallet',
    downloadUrl: 'https://www.subwallet.app/zh/'
  },
  talisman: {
    key: 'talisman',
    icon: Talisman,
    disabledIcon: TalismanDisabled,
    name: 'Talisman',
    downloadUrl: 'https://www.talisman.xyz/'
  },
  'fearless-wallet': {
    key: 'fearless-wallet',
    icon: Fearless,
    disabledIcon: FearlessDisabled,
    name: 'Fearless',
    downloadUrl: 'https://fearlesswallet.io/'
  },
  polkagate: {
    key: 'polkagate',
    icon: Polkagate,
    disabledIcon: PolkagateDisabled,
    name: 'Polkagate',
    downloadUrl: 'https://polkagate.xyz/'
  },
  'polkadot-js': {
    key: 'polkadot-js',
    icon: PolkadotJs,
    disabledIcon: PolkadotJsDisabled,
    name: 'Polkadot.js',
    downloadUrl: 'https://polkadot.js.org/extension/'
  },
  plutonication: {
    key: 'plutonication',
    icon: Plutonication,
    disabledIcon: Plutonication, // PlutoWallet is always enabled
    name: 'Plutonication',
    downloadUrl: 'https://plutonication.com'
  }
};
