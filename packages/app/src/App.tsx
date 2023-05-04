// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Route, Routes } from 'react-router-dom';

import BaseContainer from './BaseContainer';

function App() {
  return (
    <Routes>
      <Route element={<BaseContainer />}>
        <Route element={<>home</>} index />
        <Route element={<>dapp</>} path='dapp' />
        <Route element={<>transaction</>} path='transactions' />
        <Route element={<>address book</>} path='address-book' />
      </Route>
    </Routes>
  );
}

export default App;
