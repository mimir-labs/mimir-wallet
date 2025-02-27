// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import ReactJson from 'react-json-view';

function JsonView({
  data,
  displayDataTypes = false,
  displayObjectSize = false,
  collapseStringsAfterLength = 30,
  enableClipboard = false
}: {
  data: any;
  displayDataTypes?: boolean;
  displayObjectSize?: boolean;
  collapseStringsAfterLength?: number;
  enableClipboard?: boolean;
}) {
  return (
    <ReactJson
      style={{ width: '100%', overflow: 'auto', background: 'transparent' }}
      enableClipboard={enableClipboard}
      indentWidth={2}
      src={data}
      displayDataTypes={displayDataTypes}
      displayObjectSize={displayObjectSize}
      collapseStringsAfterLength={collapseStringsAfterLength}
      theme='summerfruit:inverted'
    />
  );
}

export default JsonView;
