// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { usePopoverContext } from '@heroui/popover';
import { pickChildren } from '@heroui/react-utils';
import { useAriaButton } from '@heroui/use-aria-button';
import { mergeProps } from '@react-aria/utils';
import React, { Children, cloneElement, useMemo } from 'react';

import { Button } from '../button/index.js';

export interface PopoverTriggerProps {
  children?: React.ReactNode;
  className?: string;
  [key: string]: any;
}

/**
 * PopoverTrigger opens the popover's content. It must be an interactive element
 * such as `button` or `a`.
 */
const PopoverTrigger = (props: PopoverTriggerProps) => {
  const { triggerRef, getTriggerProps } = usePopoverContext();

  const { children, ...otherProps } = props;

  // force a single child
  const child = useMemo<any>(() => {
    if (typeof children === 'string') return <p>{children}</p>;

    return Children.only(children) as React.ReactElement & {
      ref?: React.Ref<any>;
    };
  }, [children]);

  // Accessing the ref from props, else fallback to element.ref
  // https://github.com/facebook/react/pull/28348
  const childRef = child.props.ref ?? (child as any).ref;

  const { onPress, isDisabled, ...restProps } = useMemo(() => {
    return getTriggerProps(mergeProps(otherProps, child.props), childRef);
  }, [getTriggerProps, child.props, otherProps, childRef]);

  // validates if contains a HeroUI Button as a child
  const [, triggerChildren] = pickChildren(children, Button);

  const { buttonProps } = useAriaButton({ onPress, isDisabled }, triggerRef);

  const hasHeroUIButton = useMemo<boolean>(() => {
    return triggerChildren?.[0] !== undefined;
  }, [triggerChildren]);

  if (!hasHeroUIButton) {
    // delete `preventFocusOnPress` introduced from useMenuTrigger
    // to avoid passing it to non-HeroUI Button components
    delete restProps['preventFocusOnPress'];
  }

  return cloneElement(child, mergeProps(restProps, hasHeroUIButton ? { onPress, isDisabled } : buttonProps));
};

PopoverTrigger.displayName = 'HeroUI.PopoverTrigger';

export default PopoverTrigger;
