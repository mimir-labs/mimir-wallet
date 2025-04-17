// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { FocusableElement } from '@react-types/shared';

import { type LinkProps, useLink } from '@heroui/link';
import { useDOMRef } from '@heroui/react-utils';
import { LinkIcon } from '@heroui/shared-icons';
import { forwardRef } from '@heroui/system';
import { linkAnchorClasses } from '@heroui/theme';
import { usePress } from '@react-aria/interactions';
import { shouldClientNavigate } from '@react-aria/utils';
import { useNavigate } from 'react-router-dom';

const Link = forwardRef<'a', LinkProps>(({ onPressStart, onPressEnd, isDisabled, onPress, ...props }, ref) => {
  const {
    Component,
    children,
    showAnchorIcon,
    anchorIcon = <LinkIcon className={linkAnchorClasses} />,
    getLinkProps
  } = useLink({
    ref: ref,
    color: props.color || 'primary',
    size: props.size || 'md',
    className: `text-[length:inherit] ${props.className || ''}`,
    ...props
  });
  const navigate = useNavigate();
  const domRef = useDOMRef(ref);

  const { pressProps } = usePress({
    onPress: onPress,
    onPressStart,
    onPressEnd,
    isDisabled,
    ref: domRef
  });

  return (
    <Component
      {...getLinkProps()}
      {...pressProps}
      onClick={(e: React.MouseEvent<FocusableElement>) => {
        const href = props.href;

        const link = e.currentTarget as HTMLAnchorElement;

        if (href && shouldClientNavigate(link, e)) {
          e.preventDefault();
          navigate(href);
        } else {
          /* empty */
        }

        pressProps.onClick?.(e);
      }}
    >
      <>
        {children}
        {showAnchorIcon && anchorIcon}
      </>
    </Component>
  );
});

export default Link;
