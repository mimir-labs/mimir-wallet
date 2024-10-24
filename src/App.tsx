// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Navigate, Route, Routes } from 'react-router-dom';

import BaseContainer from './containers/BaseContainer';
import PageAccountSetting from './pages/account-setting';
import PageAddProxy from './pages/add-proxy';
import PageAddressBook from './pages/address-book';
import PageCreateMultisig from './pages/create-multisig';
import PageDapp from './pages/dapp';
import PageExplorer from './pages/explorer';
import PageProfile from './pages/profile';
import PageTransactionDetails from './pages/transaction-details';
import PageTransactions from './pages/transactions';
import PageTransfer from './pages/transfer';

function App() {
  return (
    <Routes>
      <Route element={<BaseContainer withSideBar withPadding />}>
        <Route index element={<PageProfile />} />
        <Route path='/dapp' element={<PageDapp />} />
        <Route path='/transactions' element={<PageTransactions />} />
        <Route path='/transactions/:id' element={<PageTransactionDetails />} />
        <Route path='/address-book' element={<PageAddressBook />} />
        <Route path='/account-setting/:address' element={<PageAccountSetting />} />
      </Route>
      <Route element={<BaseContainer withSideBar={false} withPadding />}>
        <Route path='/create-multisig' element={<PageCreateMultisig />} />
        <Route path='/create-multisig-one' element={<PageCreateMultisig threshold1 />} />
        <Route path='/add-proxy' element={<PageAddProxy />} />
        <Route path='/create-pure' element={<PageAddProxy pure />} />
      </Route>
      <Route element={<BaseContainer withSideBar={false} withPadding={false} />}>
        <Route path='/explorer/:url' element={<PageExplorer />} />
      </Route>
      <Route path='/transfer' element={<PageTransfer />} />
      <Route path='*' element={<Navigate replace to='/' />} />
    </Routes>
  );
}

export default App;
