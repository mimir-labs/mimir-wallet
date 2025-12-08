// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

export { default as TextEllipsis } from './text-ellipsis/index.js';

// Shadcn components
export {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from './shadcn/modal-compat.js';
export * from './shadcn/index.js';
export type { ButtonProps } from './shadcn/index.js';

// Utilities
export { cn } from './lib/utils.js';

// Hooks
export * from './hooks/index.js';
