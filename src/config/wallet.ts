// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import Fearless from '@mimir-wallet/assets/images/fearless.png';
import FearlessDisabled from '@mimir-wallet/assets/images/fearless-disabled.png';
import Plutonication from '@mimir-wallet/assets/images/plutonication-icon.png';
import PolkadotJs from '@mimir-wallet/assets/images/polkadotjs.svg';
import PolkadotJsDisabled from '@mimir-wallet/assets/images/polkadotjs-disabled.svg';
import Subwallet from '@mimir-wallet/assets/images/subwallet.png';
import SubwalletDisabled from '@mimir-wallet/assets/images/subwallet-disabled.svg';
import Talisman from '@mimir-wallet/assets/images/talisman.svg';
import TalismanDisabled from '@mimir-wallet/assets/images/talisman-disabled.svg';

export type WalletConfig = {
  icon: string;
  disabledIcon: string;
  name: string;
  downloadUrl: string;
};

export const walletConfig: Record<string, WalletConfig> = {
  'subwallet-js': {
    icon: Subwallet,
    disabledIcon: SubwalletDisabled,
    name: 'SubWallet',
    downloadUrl: 'https://www.subwallet.app/zh/'
  },
  talisman: {
    icon: Talisman,
    disabledIcon: TalismanDisabled,
    name: 'Talisman',
    downloadUrl: 'https://www.talisman.xyz/'
  },
  'fearless-wallet': {
    icon: Fearless,
    disabledIcon: FearlessDisabled,
    name: 'Fearless',
    downloadUrl: 'https://fearlesswallet.io/'
  },
  'polkadot-js': {
    icon: PolkadotJs,
    disabledIcon: PolkadotJsDisabled,
    name: 'Polkadot.js',
    downloadUrl: 'https://polkadot.js.org/extension/'
  },
  plutonication: {
    icon: Plutonication,
    disabledIcon: Plutonication, // PlutoWallet is always enabled
    name: 'Plutonication',
    downloadUrl: 'https://plutonication.com'
  }
};
