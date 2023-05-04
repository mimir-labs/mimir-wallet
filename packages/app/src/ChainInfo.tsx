// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEndpoint } from '@mimirdev/react-hooks';

function ChainInfo() {
  const endpoint = useEndpoint();

  return <>{endpoint.logo ?? endpoint.text}</>;
}

export default ChainInfo;
