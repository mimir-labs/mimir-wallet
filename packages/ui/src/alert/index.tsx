// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Alert as HeroAlert, type AlertProps } from '@heroui/alert';
import { forwardRef } from '@heroui/system';
import React from 'react';

const Alert = forwardRef(({ ...props }: AlertProps, ref) => {
  return (
    <HeroAlert
      {...props}
      ref={ref}
      hideIconWrapper
      classNames={{
        ...props.classNames,
        base: ['rounded-medium', props.classNames?.base || ''],
        iconWrapper: ['w-6 h-6', props.classNames?.iconWrapper || ''],
        title: ['min-h-6 flex items-center font-bold', props.classNames?.title || ''],
        mainWrapper: ['min-h-6', props.classNames?.mainWrapper || '']
      }}
    />
  );
});

export default React.memo(Alert) as typeof HeroAlert;
