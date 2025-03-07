// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ModalHeader, type ModalHeaderProps } from '@heroui/modal';
import React, { forwardRef } from 'react';

const CustomModalHeader = forwardRef((props: ModalHeaderProps, ref) => {
  return <ModalHeader {...props} ref={ref as any} className={'font-bold text-2xl ' + (props.className || '')} />;
});

export default React.memo(CustomModalHeader) as typeof ModalHeader;
