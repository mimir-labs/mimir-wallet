// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AriaButtonProps as BaseAriaButtonProps } from '@react-types/button';
import type { DOMAttributes } from '@react-types/shared';

import { useFocusable } from '@react-aria/focus';
import { usePress } from '@react-aria/interactions';
import { filterDOMProps, mergeProps } from '@react-aria/utils';
import {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ElementType,
  HTMLAttributes,
  InputHTMLAttributes,
  RefObject
} from 'react';

export type AriaButtonProps<T extends ElementType = 'button'> = BaseAriaButtonProps<T> & {
  /** Whether text selection should be enabled on the pressable element. */
  allowTextSelectionOnPress?: boolean;
  /** The role of the button element. */
  role?: string;
};

export interface ButtonAria<T> {
  /** Props for the button element. */
  buttonProps: T;
  /** Whether the button is currently pressed. */
  isPressed: boolean;
}

// Order with overrides is important: 'button' should be default
export function useAriaButton(
  props: AriaButtonProps<'button'>,
  ref: RefObject<HTMLButtonElement>
): ButtonAria<ButtonHTMLAttributes<HTMLButtonElement>>;
export function useAriaButton(
  props: AriaButtonProps<'a'>,
  ref: RefObject<HTMLAnchorElement>
): ButtonAria<AnchorHTMLAttributes<HTMLAnchorElement>>;
export function useAriaButton(
  props: AriaButtonProps<'div'>,
  ref: RefObject<HTMLDivElement>
): ButtonAria<HTMLAttributes<HTMLDivElement>>;
export function useAriaButton(
  props: AriaButtonProps<'input'>,
  ref: RefObject<HTMLInputElement>
): ButtonAria<InputHTMLAttributes<HTMLInputElement>>;
export function useAriaButton(
  props: AriaButtonProps<'span'>,
  ref: RefObject<HTMLSpanElement>
): ButtonAria<HTMLAttributes<HTMLSpanElement>>;
export function useAriaButton(props: AriaButtonProps<ElementType>, ref: RefObject<Element>): ButtonAria<DOMAttributes>;

/**
 * Provides the behavior and accessibility implementation for a button component. Handles mouse, keyboard, and touch interactions,
 * focus behavior, and ARIA props for both native button elements and custom element types.
 * @param props - Props to be applied to the button.
 * @param ref - A ref to a DOM element for the button.
 */
export function useAriaButton(
  props: AriaButtonProps<ElementType>,
  ref: RefObject<any>
): ButtonAria<HTMLAttributes<any>> {
  const {
    elementType = 'button',
    isDisabled,
    onPress,
    onPressStart,
    onPressEnd,
    onPressChange,
    preventFocusOnPress,
    onClick,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    allowFocusWhenDisabled,
    href,
    target,
    rel,
    type = 'button',
    allowTextSelectionOnPress
  } = props;
  let additionalProps;

  if (elementType === 'button') {
    additionalProps = {
      type,
      disabled: isDisabled
    };
  } else {
    additionalProps = {
      role: 'button',
      href: elementType === 'a' && !isDisabled ? href : undefined,
      target: elementType === 'a' ? target : undefined,
      type: elementType === 'input' ? type : undefined,
      disabled: elementType === 'input' ? isDisabled : undefined,
      'aria-disabled': !isDisabled || elementType === 'input' ? undefined : isDisabled,
      rel: elementType === 'a' ? rel : undefined
    };
  }

  const { pressProps, isPressed } = usePress({
    onPressStart,
    onPressEnd,
    onPressChange,
    onPress: onPress,
    isDisabled,
    preventFocusOnPress,
    allowTextSelectionOnPress,
    ref
  });

  const { focusableProps } = useFocusable(props, ref);

  if (allowFocusWhenDisabled) {
    focusableProps.tabIndex = isDisabled ? -1 : focusableProps.tabIndex;
  }

  const buttonProps = mergeProps(focusableProps, pressProps, filterDOMProps(props, { labelable: true }));

  return {
    isPressed, // Used to indicate press state for visual
    buttonProps: mergeProps(additionalProps, buttonProps, {
      'aria-haspopup': props['aria-haspopup'],
      'aria-expanded': props['aria-expanded'],
      'aria-controls': props['aria-controls'],
      'aria-pressed': props['aria-pressed'],
      'aria-current': props['aria-current'],
      onClick
    })
  };
}
