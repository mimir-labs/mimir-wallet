// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { forwardRef, type PropsWithChildren, useEffect, useState } from 'react';

interface TextEllipsisProps {
  maxWidth?: string | number;
  className?: string;
  tooltipClassName?: string;
  tooltipDelayDuration?: number;
}

const TextEllipsis = forwardRef<HTMLSpanElement, PropsWithChildren<TextEllipsisProps>>(
  ({ maxWidth, children, className = '' }, ref) => {
    const [wrapperRef, setWrapperRef] = useState<HTMLSpanElement | null>(null);

    // Handle ref forwarding
    useEffect(() => {
      if (typeof ref === 'function') {
        ref(wrapperRef);
      } else if (ref) {
        ref.current = wrapperRef;
      }
    }, [ref, wrapperRef]);

    return (
      <span ref={setWrapperRef} style={{ maxWidth }} className={`overflow-hidden text-ellipsis ${className}`}>
        {children}
      </span>
    );
  }
);

TextEllipsis.displayName = 'TextEllipsis';

export default TextEllipsis;
