// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HTMLHeroUIProps } from '@heroui/system';
import type { AriaDialogProps } from '@react-aria/dialog';
import type { HTMLMotionProps } from 'framer-motion';

import { TRANSITION_EASINGS, TRANSITION_VARIANTS } from '@heroui/framer-utils';
import { useModalContext } from '@heroui/modal';
import { CloseIcon } from '@heroui/shared-icons';
import { useDialog } from '@react-aria/dialog';
import { DismissButton } from '@react-aria/overlays';
import { chain, mergeProps, useViewportSize } from '@react-aria/utils';
import { domAnimation, LazyMotion, m } from 'framer-motion';
import { cloneElement, isValidElement, KeyboardEvent, ReactNode, useCallback, useMemo, useRef } from 'react';

const scaleInOut = {
  enter: {
    scale: 'var(--scale-enter)',
    y: 'var(--slide-enter)',
    opacity: 1,
    willChange: 'auto',
    transition: {
      scale: {
        duration: 0.4,
        ease: TRANSITION_EASINGS.ease
      },
      opacity: {
        duration: 0.4,
        ease: TRANSITION_EASINGS.ease
      },
      y: {
        type: 'spring',
        bounce: 0,
        duration: 0.6
      }
    }
  },
  exit: {
    scale: 'var(--scale-exit)',
    y: 'var(--slide-exit)',
    opacity: 0,
    willChange: 'transform',
    transition: {
      duration: 0.3,
      ease: TRANSITION_EASINGS.ease
    }
  }
};

type KeysToOmit = 'children' | 'role';

interface ModalContentProps extends AriaDialogProps, HTMLHeroUIProps<'div', KeysToOmit> {
  children: ReactNode | ((onClose: () => void) => ReactNode);
}

const ModalContent = (props: ModalContentProps) => {
  const { as, children, role = 'dialog', ...otherProps } = props;

  const {
    Component: DialogComponent,
    domRef,
    slots,
    classNames,
    motionProps,
    backdrop,
    closeButton,
    hideCloseButton,
    disableAnimation,
    getDialogProps,
    getBackdropProps,
    getCloseButtonProps,
    onClose
  } = useModalContext();

  const ref = useRef<HTMLDivElement>(null);

  const Component = as || DialogComponent || 'div';

  const viewport = useViewportSize();

  const { dialogProps } = useDialog(
    {
      role
    },
    domRef
  );

  const closeButtonContent = isValidElement(closeButton) ? (
    cloneElement(closeButton, getCloseButtonProps())
  ) : (
    <button {...getCloseButtonProps()}>
      <CloseIcon />
    </button>
  );

  // Handle Tab key during IME composition to prevent input carryover
  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Tab' && e.nativeEvent.isComposing) {
      e.stopPropagation();
      e.preventDefault();
    }
  }, []);

  const contentProps = getDialogProps(mergeProps(dialogProps, otherProps));

  const content = (
    <Component
      {...contentProps}
      onKeyDown={chain(contentProps.onKeyDown, onKeyDown)}
      ref={ref}
      onClick={(e: any) => {
        e.stopPropagation();
      }}
    >
      <DismissButton onDismiss={onClose} />
      {!hideCloseButton && closeButtonContent}
      {typeof children === 'function' ? children(onClose) : children}
      <DismissButton onDismiss={onClose} />
    </Component>
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
          onClick={onClose}
        />
      </LazyMotion>
    );
  }, [backdrop, disableAnimation, getBackdropProps, onClose]);

  // set the height dynamically to avoid keyboard covering the bottom modal
  const viewportStyle = {
    '--visual-viewport-height': viewport.height + 'px'
  };

  const contents = disableAnimation ? (
    <div
      className={slots.wrapper({ class: classNames?.wrapper })}
      data-slot='wrapper'
      style={viewportStyle as any}
      onClick={onClose}
    >
      {content}
    </div>
  ) : (
    <LazyMotion features={domAnimation}>
      <m.div
        animate='enter'
        className={slots.wrapper({ class: classNames?.wrapper })}
        data-slot='wrapper'
        exit='exit'
        initial='exit'
        variants={scaleInOut}
        {...(motionProps as any)}
        style={viewportStyle as any}
        onClick={onClose}
      >
        {content}
      </m.div>
    </LazyMotion>
  );

  return (
    <div tabIndex={-1}>
      {backdropContent}
      {contents}
    </div>
  );
};

export default ModalContent;
