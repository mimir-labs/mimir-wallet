// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { forwardRef } from 'react';

const CallDisplaySection = forwardRef<HTMLSpanElement, { section?: string; method?: string }>(
  ({ section, method }, ref) => {
    return section && method ? (
      <span ref={ref}>
        {section}.{method}
      </span>
    ) : (
      <span ref={ref}>Unknown</span>
    );
  }
);

export default React.memo(CallDisplaySection);
