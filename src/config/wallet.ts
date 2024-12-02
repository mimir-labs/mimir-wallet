// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import Fearless from '@mimir-wallet/assets/images/fearless.png';
import FearlessDisabled from '@mimir-wallet/assets/images/fearless-disabled.png';
import Nova from '@mimir-wallet/assets/images/nova.svg';
import NovaDisabled from '@mimir-wallet/assets/images/nova-disabled.png';
import Plutonication from '@mimir-wallet/assets/images/plutonication-icon.png';
import PolkadotJs from '@mimir-wallet/assets/images/polkadotjs.svg';
import PolkadotJsDisabled from '@mimir-wallet/assets/images/polkadotjs-disabled.svg';
import Polkagate from '@mimir-wallet/assets/images/polkagate.png';
import PolkagateDisabled from '@mimir-wallet/assets/images/polkagate-disabled.png';
import Subwallet from '@mimir-wallet/assets/images/subwallet.png';
import SubwalletDisabled from '@mimir-wallet/assets/images/subwallet-disabled.svg';
import Talisman from '@mimir-wallet/assets/images/talisman.svg';
import TalismanDisabled from '@mimir-wallet/assets/images/talisman-disabled.svg';

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
