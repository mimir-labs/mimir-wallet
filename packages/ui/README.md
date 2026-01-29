# @mimir-wallet/ui

React component library for Mimir Wallet, built on ShadCN/UI with Radix UI primitives and Tailwind CSS.

## Features

- **ShadCN/UI Architecture** - Unstyled, accessible components
- **Radix UI Primitives** - Industry-leading accessibility
- **Tailwind CSS** - Utility-first styling
- **CVA Variants** - Type-safe component variants
- **Dark/Light Theme** - Built-in theme support

## Installation

```bash
pnpm add @mimir-wallet/ui
```

## Setup

```typescript
import '@mimir-wallet/ui/styles.css';
```

## Usage

```typescript
import {
  Button,
  Input,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Alert,
  cn,
} from '@mimir-wallet/ui';

// Button with variants
<Button variant="ghost" size="sm" color="primary">
  Action
</Button>

// Dialog
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirm</DialogTitle>
    </DialogHeader>
    {/* content */}
  </DialogContent>
</Dialog>

// Class merging utility
<div className={cn('base-class', condition && 'conditional-class')} />
```

## Components

**Form**: Button, Input, Textarea, Select, Checkbox, Switch, Combobox
**Overlay**: Dialog, Drawer, Popover, Tooltip, DropdownMenu
**Feedback**: Alert, Spinner, Skeleton
**Data**: Table, Avatar, Badge, Card, Tabs
**Layout**: Divider, ScrollArea, Collapsible, Sidebar

## License

[Apache License 2.0](../../LICENSE)
