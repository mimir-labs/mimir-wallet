// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DeriveBalancesAll, DeriveStakingAccount } from '@polkadot/api-derive/types';

import { Fund } from '@mimir-wallet/components';
import { useApi, useCall, useGroupAccounts, useSelectedAccount, useToggle } from '@mimir-wallet/hooks';
import { BN, BN_ZERO } from '@polkadot/util';
import { useEffect, useMemo, useState } from 'react';

import Assets from './Assets';
import Info from './Info';
import Members from './Members';
import Transactions from './Transactions';
import { AccountBalance } from './types';
import Welcome from './Welcome';
import ProfileWrapper from './Wrapper';

function calcUnbonding(stakingInfo?: DeriveStakingAccount) {
  if (!stakingInfo?.unlocking) {
    return BN_ZERO;
  }

  const filtered = stakingInfo.unlocking.filter(({ remainingEras, value }) => value.gt(BN_ZERO) && remainingEras.gt(BN_ZERO)).map((unlock) => unlock.value);
  const total = filtered.reduce((total, value) => total.iadd(value), new BN(0));

  return total;
}

function PageProfile() {
  const { api } = useApi();
  const { multisig } = useGroupAccounts();
  const selected = useSelectedAccount();
  const balancesAll = useCall<DeriveBalancesAll>(api.derive.balances?.all, [selected]);
  const stakingInfo = useCall<DeriveStakingAccount>(api.derive.staking?.account, [selected]);
  const [balances, setBalances] = useState<AccountBalance>();
  const [fundOpen, toggleFundOpen] = useToggle();

  useEffect(() => {
    if (balancesAll) {
      setBalances({
        // some chains don't have "active" in the Ledger
        bonded: stakingInfo?.stakingLedger.active?.unwrap() || BN_ZERO,
        locked: balancesAll.lockedBalance,
        redeemable: stakingInfo?.redeemable || BN_ZERO,
        total: balancesAll.freeBalance.add(balancesAll.reservedBalance),
        transferrable: balancesAll.availableBalance,
        unbonding: calcUnbonding(stakingInfo)
      });
    }
  }, [balancesAll, stakingInfo]);

  const assets = useMemo(() => (balances ? [balances] : []), [balances]);

  return (
    <>
      {multisig.length > 0 ? (
        <ProfileWrapper
          assets={<Assets address={selected} assets={assets} />}
          info={<Info address={selected} balances={balances} toggleFundOpen={toggleFundOpen} />}
          member={<Members address={selected} />}
          transaction={<Transactions />}
        />
      ) : (
        <Welcome />
      )}
      <Fund onClose={toggleFundOpen} open={fundOpen} receipt={selected} />
    </>
  );
}

export default PageProfile;
