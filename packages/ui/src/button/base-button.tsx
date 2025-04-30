// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ButtonProps } from '@heroui/button';

import { Ripple } from '@heroui/ripple';
import { Spinner } from '@heroui/spinner';
import { forwardRef } from '@heroui/system';

import { useButton } from './useButton.js';

const Button = forwardRef<'button', ButtonProps>((props, ref) => {
  const {
    Component,
    domRef,
    children,
    spinnerSize,
    spinner = <Spinner color='current' size={spinnerSize} />,
    spinnerPlacement,
    startContent,
    endContent,
    isLoading,
    disableRipple,
    getButtonProps,
    getRippleProps,
    isIconOnly
  } = useButton({ ...props, ref });

  return (
    <Component ref={domRef} {...getButtonProps()}>
      {startContent}
      {isLoading && spinnerPlacement === 'start' && spinner}
      {isLoading && isIconOnly ? null : children}
      {isLoading && spinnerPlacement === 'end' && spinner}
      {endContent}
      {!disableRipple && <Ripple {...getRippleProps()} />}
    </Component>
  );
});

Button.displayName = 'HeroUI.Button';

export default Button;
