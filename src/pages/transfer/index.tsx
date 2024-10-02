// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Navigate } from 'react-router-dom';

function Transfer() {
  return <Navigate replace to={`/explorer/${encodeURIComponent('mimir://app/transfer')}`} />;
}

export default Transfer;
