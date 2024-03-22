// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Fund } from '@mimir-wallet/components';
import { useDapps, useGroupAccounts, useNativeBalances, useProposal, useSelectedAccount, useToggle } from '@mimir-wallet/hooks';

import Assets from './Assets';
import FavoriteDapps from './FavoriteDapp';
import Info from './Info';
import Members from './Members';
import Proposals from './Proposals';
import Transactions from './Transactions';
import Welcome from './Welcome';
import ProfileWrapper from './Wrapper';

function PageProfile() {
  const { multisig } = useGroupAccounts();
  const selected = useSelectedAccount();
  const [fundOpen, toggleFundOpen] = useToggle();
  const { addFavorite, favorites, isFavorite, removeFavorite } = useDapps();
  const proposals = useProposal();
  const balances = useNativeBalances(selected);

  return (
    <>
      {multisig.length > 0 ? (
        <ProfileWrapper
          assets={<Assets address={selected} nativeBalance={balances} />}
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
