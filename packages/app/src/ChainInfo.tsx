// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useApi, useEndpoint } from '@mimirdev/react-hooks';

function ChainInfo() {
  const endpoint = useEndpoint();
  const { systemChain } = useApi();

  return <>{endpoint ? endpoint.logo ?? endpoint.text : systemChain}</>;
}

export default ChainInfo;
