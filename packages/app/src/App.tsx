// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Route, Routes } from 'react-router-dom';

import PageCreateMultisig from '@mimirdev/page-create-multisig';
import PageProfile from '@mimirdev/page-profile';

import BaseContainer from './containers/BaseContainer';
import PageWrapper from './containers/PageWrapper';
import SideBar from './containers/SideBar';

function App() {
  return (
    <Routes>
      <Route element={<BaseContainer />}>
        <Route element={<SideBar />}>
          <Route element={<PageProfile />} index />
          <Route element={<>dapp</>} path='dapp' />
          <Route element={<>transaction</>} path='transactions' />
          <Route element={<>address book</>} path='address-book' />
        </Route>
        <Route element={<PageWrapper />}>
          <Route element={<PageCreateMultisig />} path='create-multisig' />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
