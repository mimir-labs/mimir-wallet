// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { LinkIcon } from '@heroui/shared-icons';
import { forwardRef } from '@heroui/system';
import { linkAnchorClasses } from '@heroui/theme';

import { useLink, UseLinkProps } from './useLink.js';

export type LinkProps = UseLinkProps;

const Link = forwardRef<'a', LinkProps>((props, ref) => {
  const {
    Component,
    children,
    showAnchorIcon,
    anchorIcon = <LinkIcon className={linkAnchorClasses} />,
    getLinkProps
  } = useLink({
    ref,
    ...props
  });

  return (
    <Component {...getLinkProps()}>
      <>
        {children}
        {showAnchorIcon && anchorIcon}
      </>
    </Component>
  );
});

Link.displayName = 'HeroUI.Link';

export default Link;
