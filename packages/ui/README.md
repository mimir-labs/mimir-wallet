# @mimir-wallet/ui

A modern React UI component library built for Mimir Wallet, featuring ShadCN/UI components with Radix UI primitives, designed for enterprise blockchain applications.

## Overview

This package provides a comprehensive set of React components using **ShadCN/UI architecture** - unstyled, accessible components built on Radix UI primitives with Tailwind CSS styling.

## Features

### Modern Design System
- **ShadCN/UI Foundation** - Unstyled, accessible components built on Radix UI
- **Radix UI Primitives** - Industry-leading accessibility as building blocks
- **Class Variance Authority (CVA)** - Type-safe component variants
- **Tailwind CSS v4.1** - Modern utility-first styling with latest features
- **Dark/Light Theme Support** - Consistent theming across components

### Enhanced Accessibility
- **Radix UI Accessibility** - Industry-leading accessibility for all components
- **Keyboard Navigation** - Full keyboard support across all components
- **Screen Reader Optimized** - Enhanced assistive technology support
- **ARIA Support** - Comprehensive ARIA implementation

### Component Categories

#### Form Controls
- Button, Input, Textarea, Select, Checkbox, Switch, Combobox, Autocomplete

#### Overlays & Dialogs
- Dialog, Drawer, Popover, Tooltip, DropdownMenu

#### Feedback
- Alert, AlertTitle, AlertDescription, Spinner, Skeleton

#### Data Display
- Table, Avatar, Badge, Card, Tabs

#### Layout
- Divider, ScrollArea, Collapsible, Sidebar

### Developer Experience
- **TypeScript First** - Full type safety with inference
- **Tree Shaking** - Optimized bundle size
- **Component Variants** - Type-safe styling variants with CVA
- **Utility Functions** - `cn()` for class merging

## Installation

This package is part of the Mimir Wallet monorepo:

```bash
pnpm add @mimir-wallet/ui
```

### Dependencies

```json
{
  "dependencies": {
    "@radix-ui/*": "^1.x",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.3.1"
  }
}
```

## Setup

### Import Styles

```typescript
import '@mimir-wallet/ui/styles.css';
```

## Usage

### Basic Components

```typescript
import {
  Button,
  Input,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Alert,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  cn
} from '@mimir-wallet/ui';

// Button with CVA variants
<Button
  variant="ghost"
  size="sm"
  color="primary"
  radius="full"
  className={cn("custom-styles")}
>
  Action
</Button>

// Input
<Input
  placeholder="Enter amount"
  type="number"
  className="w-full"
/>

// Dialog
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Transfer Confirmation</DialogTitle>
    </DialogHeader>
    {/* content */}
  </DialogContent>
</Dialog>

// DropdownMenu with multi-select
<DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
  <DropdownMenuTrigger asChild>
    <Button variant="bordered">Select Networks</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    {options.map((option) => (
      <DropdownMenuCheckboxItem
        key={option.id}
        checked={selected.includes(option.id)}
        onSelect={(e) => e.preventDefault()}
        onCheckedChange={(checked) => {
          // Handle selection logic
        }}
      >
        {option.name}
      </DropdownMenuCheckboxItem>
    ))}
  </DropdownMenuContent>
</DropdownMenu>
```

### Data Display

```typescript
import { Table, TableHeader, TableBody, TableRow, TableCell, Avatar, Card, CardHeader, CardTitle, CardContent } from '@mimir-wallet/ui';

// Table
<Table>
  <TableHeader>
    <TableRow>
      <TableCell>Address</TableCell>
      <TableCell>Balance</TableCell>
    </TableRow>
  </TableHeader>
  <TableBody>
    {/* rows */}
  </TableBody>
</Table>

// Card with Avatar
<Card>
  <CardHeader>
    <CardTitle>Account Info</CardTitle>
  </CardHeader>
  <CardContent>
    <Avatar src={account.avatar} name={account.name} />
    <div>
      <h4>{account.name}</h4>
      <p className="text-sm">{account.address}</p>
    </div>
  </CardContent>
</Card>
```

### Utility Functions

```typescript
import { cn } from '@mimir-wallet/ui';

// Class merging with conflict resolution
const className = cn(
  "base-styles",
  "conditional-styles",
  isActive && "active-styles",
  props.className
);
```

## Architecture

```
@mimir-wallet/ui/
├── src/
│   ├── shadcn/              # ShadCN/UI components
│   │   ├── button.tsx       # Button with CVA variants
│   │   ├── input.tsx        # Input component
│   │   ├── dialog.tsx       # Dialog system
│   │   ├── alert.tsx        # Alert component
│   │   ├── dropdown-menu.tsx # Dropdown menu
│   │   ├── table.tsx        # Table component
│   │   ├── tabs.tsx         # Tabs component
│   │   ├── avatar.tsx       # Avatar component
│   │   └── ...              # Other components
│   ├── lib/                 # Utility functions
│   │   └── utils.ts         # cn() class merger
│   ├── hooks/               # Custom hooks
│   └── index.ts             # Unified exports
```

## Best Practices

### Styling
```typescript
// Use cn() for class merging
import { cn } from '@mimir-wallet/ui';
const className = cn("base-classes", conditionalClass, props.className);

// Leverage component variants
<Button variant="ghost" size="sm" color="primary" />

// Avoid custom styling that breaks design system
// <Button className="h-12 px-8 bg-blue-500" /> // Not recommended
```

### Imports
```typescript
// Import from unified package
import { Button, Card, Table } from '@mimir-wallet/ui';

// Avoid direct Radix imports in application code
// import { Button } from '@radix-ui/react-button'; // Not recommended
```

## Contributing

When contributing to this package:

1. **New Components**: Follow ShadCN/UI patterns with Radix UI primitives
2. **Styling**: Use Tailwind CSS and CVA for variants
3. **Accessibility**: Ensure full keyboard and screen reader support
4. **Testing**: Ensure components work correctly across themes

## License

Licensed under the Apache License, Version 2.0. See [LICENSE](../../LICENSE) for details.
