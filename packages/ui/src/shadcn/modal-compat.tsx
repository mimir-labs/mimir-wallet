// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { createContext, forwardRef, useContext } from 'react';

import { cn } from '../lib/utils.js';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './dialog.js';

// Size mapping from HeroUI to Tailwind classes
const sizeClassNames = {
  xs: 'max-w-xs',
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl'
} as const;

interface CompatProps {
  size?: keyof typeof sizeClassNames;
  hideCloseButton?: boolean;
}

const context = createContext<CompatProps>({});

export interface ModalProps extends CompatProps {
  children?: React.ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

function Modal({ children, isOpen = false, size, hideCloseButton, onClose, ...props }: ModalProps) {
  const handleOpenChange = (open: boolean) => {
    if (!open && onClose) {
      onClose();
    }
  };

  return (
    <context.Provider value={{ size, hideCloseButton }}>
      <Dialog open={isOpen} onOpenChange={handleOpenChange} {...props}>
        {children}
      </Dialog>
    </context.Provider>
  );
}

Modal.displayName = 'Modal';

const ModalContent = forwardRef<HTMLDivElement, React.ComponentProps<typeof DialogContent>>(
  ({ children, className, ...props }, ref) => {
    const { size = 'lg', hideCloseButton = false } = useContext(context);

    return (
      <DialogContent
        ref={ref}
        className={cn(sizeClassNames[size], 'gap-5', className)}
        showCloseButton={props.showCloseButton ?? !hideCloseButton}
        {...props}
      >
        {children}
      </DialogContent>
    );
  }
);

ModalContent.displayName = 'ModalContent';

export interface ModalHeaderProps {
  children?: React.ReactNode;
  className?: string;
}

const ModalHeader = forwardRef<HTMLDivElement, ModalHeaderProps>(({ children, className, ...props }, ref) => {
  const isTextContent = typeof children === 'string';

  return (
    <DialogHeader ref={ref} className={className} {...props}>
      {isTextContent ? <DialogTitle className='text-2xl font-bold'>{children}</DialogTitle> : children}
    </DialogHeader>
  );
});

ModalHeader.displayName = 'ModalHeader';

export interface ModalBodyProps {
  children?: React.ReactNode;
  className?: string;
}

const ModalBody = forwardRef<HTMLDivElement, ModalBodyProps>(({ children, className, ...props }, ref) => {
  return (
    <div ref={ref} className={cn('flex flex-col gap-2.5 p-0', className)} {...props}>
      {children}
    </div>
  );
});

ModalBody.displayName = 'ModalBody';

export interface ModalFooterProps {
  children?: React.ReactNode;
  className?: string;
}

const ModalFooter = forwardRef<HTMLDivElement, ModalFooterProps>(({ children, className, ...props }, ref) => {
  return (
    <DialogFooter ref={ref} className={cn('gap-2', className)} {...props}>
      {children}
    </DialogFooter>
  );
});

ModalFooter.displayName = 'ModalFooter';

export { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader };
