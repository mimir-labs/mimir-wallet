// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AriaLinkProps } from '@react-types/link';
import type { DOMAttributes, FocusableElement } from '@react-types/shared';

import { useFocusable } from '@react-aria/focus';
import { usePress } from '@react-aria/interactions';
import { filterDOMProps, mergeProps, shouldClientNavigate, useLinkProps, useRouter } from '@react-aria/utils';
import { RefObject } from 'react';

export interface AriaLinkOptions extends AriaLinkProps {
  /** Indicates the element that represents the current item within a container or set of related elements. */
  'aria-current'?: DOMAttributes['aria-current'];
  /** Whether the link is disabled. */
  isDisabled?: boolean;
  /** The role of the element */
  role?: string;
  /** The type of the element, e.g. 'button' */
  type?: string;
  /**
   * The HTML element used to render the link, e.g. 'a', or 'span'.
   * @default 'a'
   */
  elementType?: string;
}

export interface LinkAria {
  /** Props for the link element. */
  linkProps: DOMAttributes;
  /** Whether the link is currently pressed. */
  isPressed: boolean;
}

/**
 * Provides the behavior and accessibility implementation for a link component.
 * A link allows a user to navigate to another page or resource within a web page
 * or application.
 */
export function useAriaLink(props: AriaLinkOptions, ref: RefObject<FocusableElement>): LinkAria {
  const {
    elementType = 'a',
    onClick: deprecatedOnClick,
    onPress,
    onPressStart,
    onPressEnd,
    isDisabled,
    ...otherProps
  } = props;

  let linkProps: DOMAttributes = {};

  if (elementType !== 'a') {
    linkProps = {
      role: 'link',
      tabIndex: !isDisabled ? 0 : undefined
    };
  }

  const { focusableProps } = useFocusable(props, ref);
  const { pressProps, isPressed } = usePress({
    onPress: (e) => {
      onPress?.(e);

      if (
        !router.isNative &&
        e.target instanceof HTMLAnchorElement &&
        e.target.href &&
        // If props are applied to a router Link component, it may have already prevented default.
        shouldClientNavigate(e.target, e) &&
        props.href
      ) {
        router.open(e.target, e, props.href, props.routerOptions);
      }
    },
    onPressStart,
    onPressEnd,
    isDisabled,
    ref
  });
  const domProps = filterDOMProps(otherProps, { labelable: true, isLink: elementType === 'a' });
  const interactionHandlers = mergeProps(focusableProps, pressProps);
  const router = useRouter();
  const routerLinkProps = useLinkProps(props);

  return {
    isPressed, // Used to indicate press state for visual
    linkProps: mergeProps(domProps, routerLinkProps, {
      ...interactionHandlers,
      ...linkProps,
      'aria-disabled': isDisabled || undefined,
      'aria-current': props['aria-current'],
      onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
        pressProps.onClick?.(e);

        if (deprecatedOnClick) {
          deprecatedOnClick(e);
        }

        // If a custom router is provided, prevent default and forward if this link should client navigate.

        if (
          !router.isNative &&
          e.currentTarget instanceof HTMLAnchorElement &&
          e.currentTarget.href &&
          shouldClientNavigate(e.currentTarget, e) &&
          props.href
        ) {
          e.preventDefault();
        }
      }
    })
  };
}
