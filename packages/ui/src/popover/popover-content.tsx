// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HTMLHeroUIProps } from '@heroui/system';
import type { AriaDialogProps } from '@react-aria/dialog';
import type { HTMLMotionProps } from 'framer-motion';

import { getTransformOrigins } from '@heroui/aria-utils';
import { TRANSITION_VARIANTS } from '@heroui/framer-utils';
import { usePopoverContext } from '@heroui/popover';
import { useDialog } from '@react-aria/dialog';
import { DismissButton } from '@react-aria/overlays';
import { domAnimation, LazyMotion, m } from 'framer-motion';
import { DOMAttributes, ReactNode, useEffect, useMemo, useRef } from 'react';

export interface PopoverContentProps extends AriaDialogProps, Omit<HTMLHeroUIProps, 'children' | 'role'> {
  children: ReactNode | ((titleProps: DOMAttributes<HTMLElement>) => ReactNode);
}

const PopoverContent = (props: PopoverContentProps) => {
  const { as, children, className, ...otherProps } = props;

  const {
    Component: OverlayComponent,
    placement,
    backdrop,
    motionProps,
    disableAnimation,
    getPopoverProps,
    getDialogProps,
    getBackdropProps,
    getContentProps,
    isNonModal,
    onClose,
    state
  } = usePopoverContext();

  const dialogRef = useRef(null);
  const { dialogProps: ariaDialogProps, titleProps } = useDialog({}, dialogRef);
  const dialogProps = getDialogProps({
    ref: dialogRef,
    ...ariaDialogProps,
    ...otherProps
  });

  const Component = as || OverlayComponent || 'div';

  const content = (
    <>
      {!isNonModal && <DismissButton onDismiss={onClose} />}
      <Component {...dialogProps}>
        <div {...getContentProps({ className })}>
          {typeof children === 'function' ? children(titleProps) : children}
        </div>
      </Component>
      <DismissButton onDismiss={onClose} />
    </>
  );

  const backdropContent = useMemo(() => {
    if (backdrop === 'transparent') {
      return null;
    }

    if (disableAnimation) {
      return <div {...getBackdropProps()} />;
    }

    return (
      <LazyMotion features={domAnimation}>
        <m.div
          animate='enter'
          exit='exit'
          initial='exit'
          variants={TRANSITION_VARIANTS.fade}
          {...(getBackdropProps() as HTMLMotionProps<'div'>)}
        />
      </LazyMotion>
    );
  }, [backdrop, disableAnimation, getBackdropProps]);

  useEffect(() => {
    const handleBlur = () => {
      state.close();
    };

    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('blur', handleBlur);
    };
  }, [state]);

  const style = placement ? getTransformOrigins(placement === 'center' ? 'top' : placement) : undefined;
  const contents = (
    <>
      {disableAnimation ? (
        content
      ) : (
        <LazyMotion features={domAnimation}>
          <m.div
            animate='enter'
            exit='exit'
            initial='initial'
            style={style}
            variants={TRANSITION_VARIANTS.scaleSpringOpacity}
            {...motionProps}
          >
            {content}
          </m.div>
        </LazyMotion>
      )}
    </>
  );

  return (
    <div {...getPopoverProps()}>
      {backdropContent}
      {contents}
    </div>
  );
};

PopoverContent.displayName = 'HeroUI.PopoverContent';

export default PopoverContent;
