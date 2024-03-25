// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Fund } from '@mimir-wallet/components';
import { NOT_CREATE_MULTISIG_NOW_KEY } from '@mimir-wallet/constants';
import { useDapps, useGroupAccounts, useNativeBalances, useProposal, useSelectedAccount, useToggle } from '@mimir-wallet/hooks';
import { useState } from 'react';
import store from 'store';

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
  const [notNow, setNotNow] = useState(!!store.get(NOT_CREATE_MULTISIG_NOW_KEY));

  return (
    <>
      {multisig.length > 0 || (notNow && selected) ? (
        <ProfileWrapper
          assets={<Assets address={selected} nativeBalance={balances} />}
          dapps={favorites.length > 0 ? <FavoriteDapps addFavorite={addFavorite} dapps={favorites} isFavorite={isFavorite} removeFavorite={removeFavorite} /> : null}
          info={<Info address={selected} balances={balances} toggleFundOpen={toggleFundOpen} />}
          member={<Members address={selected} />}
          proposals={proposals.length > 0 ? <Proposals data={proposals} /> : null}
          transaction={<Transactions address={selected} />}
        />
      ) : (
        <Welcome handleNotNow={() => setNotNow(true)} />
      )}
      <Fund onClose={toggleFundOpen} open={fundOpen} receipt={selected} />
    </>
  );
}

export default PageProfile;
