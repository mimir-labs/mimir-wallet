// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DeriveBalancesAll, DeriveStakingAccount } from '@polkadot/api-derive/types';

import { Fund } from '@mimir-wallet/components';
import { useApi, useCall, useDapps, useGroupAccounts, useProposal, useSelectedAccount, useToggle } from '@mimir-wallet/hooks';
import { BN, BN_ZERO } from '@polkadot/util';
import { useEffect, useMemo, useState } from 'react';

import Assets from './Assets';
import FavoriteDapps from './FavoriteDapp';
import Info from './Info';
import Members from './Members';
import Proposals from './Proposals';
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
  const { addFavorite, favorites, isFavorite, removeFavorite } = useDapps();
  const proposals = useProposal();

  useEffect(() => {
    if (balancesAll) {
      setBalances({
        // some chains don't have "active" in the Ledger
        bonded: stakingInfo?.stakingLedger.active?.unwrap() || BN_ZERO,
        reserved: balancesAll.reservedBalance,
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
          dapps={favorites.length > 0 ? <FavoriteDapps addFavorite={addFavorite} dapps={favorites} isFavorite={isFavorite} removeFavorite={removeFavorite} /> : null}
          info={<Info address={selected} balances={balances} toggleFundOpen={toggleFundOpen} />}
          member={<Members address={selected} />}
          proposals={proposals.length > 0 ? <Proposals data={proposals} /> : null}
          transaction={<Transactions address={selected} />}
        />
      ) : (
        <Welcome />
      )}
      <Fund onClose={toggleFundOpen} open={fundOpen} receipt={selected} />
    </>
  );
}

export default PageProfile;
