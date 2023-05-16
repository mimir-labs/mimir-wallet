// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Route, Routes } from 'react-router-dom';

import PageAddressBook from '@mimirdev/page-address-book';
import PageCreateMultisig from '@mimirdev/page-create-multisig';
import PageDapp from '@mimirdev/page-dapp';
import PageProfile from '@mimirdev/page-profile';
import PageTransaction from '@mimirdev/page-transaction';
import PageTransfer from '@mimirdev/page-transfer';

import BaseContainer from './containers/BaseContainer';
import PageWrapper from './containers/PageWrapper';
import SideBar from './containers/SideBar';

function App() {
  return (
    <Routes>
      <Route element={<BaseContainer />}>
        <Route element={<SideBar />}>
          <Route element={<PageProfile />} index />
          <Route element={<PageDapp />} path='dapp' />
          <Route element={<PageTransaction />} path='transactions' />
          <Route element={<PageAddressBook />} path='address-book' />
        </Route>
        <Route element={<PageWrapper />}>
          <Route element={<PageCreateMultisig />} path='create-multisig' />
          <Route element={<PageTransfer />} path='transfer/:sender?' />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
