// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { LinkVariantProps } from '@heroui/theme';
import type { AriaLinkProps } from '@react-types/link';
import type { MouseEventHandler } from 'react';

import { type ReactRef, useDOMRef } from '@heroui/react-utils';
import { dataAttr, objectToDeps } from '@heroui/shared-utils';
import { type HTMLHeroUIProps, mapPropsVariants, type PropGetter, useProviderContext } from '@heroui/system';
import { link } from '@heroui/theme';
import { useFocusRing } from '@react-aria/focus';
import { mergeProps } from '@react-aria/utils';
import { useCallback, useMemo } from 'react';

import { useAriaLink } from './useAriaLink.js';

interface Props extends HTMLHeroUIProps<'a'>, LinkVariantProps {
  /**
   * Ref to the DOM node.
   */
  ref?: ReactRef<HTMLAnchorElement | null>;
  /**
   * Whether the link is external.
   * @default false
   */
  isExternal?: boolean;
  /**
   * Whether to show the icon when the link is external.
   * @default false
   */
  showAnchorIcon?: boolean;
  /**
   * The icon to display right after the link.
   * @default <LinkIcon />
   */
  anchorIcon?: React.ReactNode;
  /**
   * The native link click event handler.
   * use `onPress` instead.
   * @deprecated
   */
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

export type UseLinkProps = Props & AriaLinkProps;

export function useLink(originalProps: UseLinkProps) {
  const globalContext = useProviderContext();

  const [props, variantProps] = mapPropsVariants(originalProps, link.variantKeys);

  const {
    ref,
    as,
    children,
    anchorIcon,
    isExternal = false,
    showAnchorIcon = false,
    autoFocus = false,
    className,
    onPress,
    onPressStart,
    onPressEnd,
    onClick,
    ...otherProps
  } = props;

  const Component = as || 'a';

  const domRef = useDOMRef(ref);
  const disableAnimation = originalProps?.disableAnimation ?? globalContext?.disableAnimation ?? false;

  // use `@heroui/use-aria-link` to suppress onClick deprecation warning
  const { linkProps } = useAriaLink(
    {
      ...otherProps,
      onPress,
      onPressStart,
      onPressEnd,
      onClick,
      isDisabled: originalProps.isDisabled,
      elementType: `${as}`
    },
    domRef
  );

  const { isFocused, isFocusVisible, focusProps } = useFocusRing({
    autoFocus
  });

  if (isExternal) {
    otherProps.rel = otherProps.rel ?? 'noopener noreferrer';
    otherProps.target = otherProps.target ?? '_blank';
  }

  const styles = useMemo(
    () =>
      link({
        ...variantProps,
        disableAnimation,
        className
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [objectToDeps(variantProps), disableAnimation, className]
  );

  const getLinkProps: PropGetter = useCallback(() => {
    return {
      ref: domRef,
      className: styles,
      'data-focus': dataAttr(isFocused),
      'data-disabled': dataAttr(originalProps.isDisabled),
      'data-focus-visible': dataAttr(isFocusVisible),
      ...mergeProps(focusProps, linkProps, otherProps)
    };
  }, [domRef, styles, isFocused, originalProps.isDisabled, isFocusVisible, focusProps, linkProps, otherProps]);

  return { Component, children, anchorIcon, showAnchorIcon, getLinkProps };
}

export type UseLinkReturn = ReturnType<typeof useLink>;
