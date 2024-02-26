// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

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
  'polkadot-js': {
    icon: PolkadotJs,
    disabledIcon: PolkadotJsDisabled,
    name: 'Polkadot.js',
    downloadUrl: 'https://polkadot.js.org/extension/'
  },
  'subwallet-js': {
    icon: Subwallet,
    disabledIcon: SubwalletDisabled,
    name: 'Subwallet',
    downloadUrl: 'https://www.subwallet.app/zh/'
  },
  talisman: {
    icon: Talisman,
    disabledIcon: TalismanDisabled,
    name: 'Talisman',
    downloadUrl: 'https://www.talisman.xyz/'
  }
};
