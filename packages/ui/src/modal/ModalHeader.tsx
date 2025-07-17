// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ModalHeader, type ModalHeaderProps } from '@heroui/modal';
import React, { forwardRef } from 'react';

const CustomModalHeader = forwardRef((props: ModalHeaderProps, ref) => {
  return <ModalHeader {...props} ref={ref as any} className={'text-2xl font-bold ' + (props.className || '')} />;
});

export default React.memo(CustomModalHeader) as typeof ModalHeader;
