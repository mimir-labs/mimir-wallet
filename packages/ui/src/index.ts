// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Avatar, AvatarGroup } from '@heroui/avatar';
import { Badge } from '@heroui/badge';
import { HeroUIProvider } from '@heroui/system';

export { Avatar, AvatarGroup, Badge, HeroUIProvider };

export { Checkbox, CheckboxGroup, CheckboxIcon } from './checkbox/index.js';
export { default as Chip } from './chip/index.js';
export { Divider } from './divider/index.js';
export { default as Skeleton } from './skeleton/index.js';
export * from './spinner/index.js';
export { Switch } from './switch/index.js';
export { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from './table/index.js';
export { Tabs, Tab } from './tabs/index.js';
export { default as TextEllipsis } from './text-ellipsis/index.js';

// Shadcn components
export { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from './shadcn/modal-compat.js';
export * from './shadcn/index.js';
export type { ButtonProps } from './shadcn/index.js';

// Utilities
export { cn } from './lib/utils.js';
