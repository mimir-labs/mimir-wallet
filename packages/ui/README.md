# @mimir-wallet/ui

A modern, hybrid React UI component library built for Mimir Wallet, featuring both HeroUI and ShadCN/UI components in a unified system designed for enterprise blockchain applications.

## Overview

This package provides a comprehensive set of React components using a **hybrid architecture** that combines the best of both HeroUI v2 and ShadCN/UI. This approach enables gradual migration while maintaining backward compatibility and leveraging modern component patterns.

## Architecture Strategy

### 🔄 Hybrid Component System

We employ a **dual-library approach** that allows developers to choose the most appropriate component for each use case:

- **HeroUI v2 Components**: Mature, blockchain-specialized components (Avatar, Card, Table, Tabs)
- **ShadCN/UI Components**: Modern, highly customizable components (Button, Input, Dialog, Alert)
- **Unified Export**: All components exported through a single `@mimir-wallet/ui` package
- **Compatibility Layer**: Seamless transition with compatibility wrappers (e.g., `modal-compat.tsx`)

## Features

### 🎨 Modern Design System
- **Hybrid UI Foundation** - Best of HeroUI + ShadCN/UI components
- **Radix UI Primitives** - Unstyled, accessible components as building blocks
- **Class Variance Authority (CVA)** - Type-safe component variants
- **Tailwind CSS v4.1** - Modern utility-first styling with latest features
- **Dark/Light Theme Support** - Consistent theming across both component systems

### ♿ Enhanced Accessibility
- **Radix UI Accessibility** - Industry-leading accessibility for ShadCN components
- **HeroUI ARIA Support** - Comprehensive ARIA implementation
- **Keyboard Navigation** - Full keyboard support across all components
- **Screen Reader Optimized** - Enhanced assistive technology support

### 🧩 Component Categories

#### ShadCN/UI Components (Preferred for new development)
- **Form Controls**: Button, Input, Select, Checkbox
- **Overlays**: Dialog, Drawer, Popover, Tooltip, DropdownMenu
- **Feedback**: Alert, AlertTitle, AlertDescription

#### HeroUI Components (Continued use)
- **Data Display**: Avatar, Card, Table, Badge, Chip
- **Navigation**: Tabs, Autocomplete
- **Layout**: Divider, Spinner, Skeleton

### 🔧 Developer Experience
- **TypeScript First** - Full type safety with inference
- **Tree Shaking** - Optimized bundle size
- **Component Variants** - Type-safe styling variants with CVA
- **Utility Functions** - `cn()` for class merging, colorVariants for theming

## Installation

This package is part of the Mimir Wallet monorepo:

```bash
yarn add @mimir-wallet/ui
```

### Dependencies

The package includes both UI systems:

```json
{
  "dependencies": {
    "@heroui/*": "^2.x",
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

### Provider Setup

```typescript
import { HeroUIProvider } from '@mimir-wallet/ui';

function App() {
  return (
    <HeroUIProvider>
      <YourApp />
    </HeroUIProvider>
  );
}
```

## Usage Guide

### Component Selection Strategy

#### 🟢 Use ShadCN Components For:
- **Buttons**: Enhanced variant system with CVA
- **Form Inputs**: Better customization and validation
- **Dialogs/Modals**: Modern API with improved accessibility
- **Alerts**: Rich content support with title/description
- **Select Dropdowns**: Better performance and customization

#### 🔵 Use HeroUI Components For:
- **Data Tables**: Mature table implementation with sorting/selection
- **Avatars**: Specialized avatar components with fallbacks
- **Cards**: Well-established card layouts
- **Navigation Tabs**: Proven tab implementation
- **Badges/Chips**: Existing design patterns

### ShadCN Component Usage

```typescript
import {
  Button,
  Input,
  Dialog,
  Alert,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  cn
} from '@mimir-wallet/ui';

// Modern Button with CVA variants
<Button
  variant="ghost"
  size="sm"
  color="primary"
  radius="full"
  className={cn("custom-styles")}
>
  Action
</Button>

// Enhanced Input with better validation
<Input
  placeholder="Enter amount"
  type="number"
  className="w-full"
/>

// Modern Dialog system
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Transfer Confirmation</DialogTitle>
    </DialogHeader>
    {/* content */}
  </DialogContent>
</Dialog>

// DropdownMenu with multi-select (no auto-close)
<DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
  <DropdownMenuTrigger asChild>
    <Button variant="bordered">
      Select Networks
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    {options.map((option) => (
      <DropdownMenuCheckboxItem
        key={option.id}
        checked={selected.includes(option.id)}
        onSelect={(e) => e.preventDefault()} // Prevent auto-close
        onCheckedChange={(checked) => {
          // Handle selection logic
        }}
      >
        {option.name}
      </DropdownMenuCheckboxItem>
    ))}
  </DropdownMenuContent>
</DropdownMenu>

// DropdownMenu with single select (auto-close)
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="bordered">Select Chain</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuRadioGroup value={selected} onValueChange={setSelected}>
      {chains.map((chain) => (
        <DropdownMenuRadioItem key={chain.id} value={chain.id}>
          {chain.name}
        </DropdownMenuRadioItem>
      ))}
    </DropdownMenuRadioGroup>
  </DropdownMenuContent>
</DropdownMenu>
```

### HeroUI Component Usage

```typescript
import { Card, CardHeader, CardTitle, CardContent, Table, Avatar, Tabs } from '@mimir-wallet/ui';

// Mature data display components
<Table>
  <TableHeader>
    <TableColumn>Address</TableColumn>
    <TableColumn>Balance</TableColumn>
  </TableHeader>
  <TableBody>
    {/* rows */}
  </TableBody>
</Table>

// Specialized blockchain components
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
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
│   │   ├── button.tsx       # Modern button with CVA
│   │   ├── input.tsx        # Enhanced input component
│   │   ├── dialog.tsx       # Modern dialog system
│   │   ├── alert.tsx        # Rich alert component
│   │   ├── dropdown-menu.tsx # Dropdown menu with multi-select
│   │   └── modal-compat.tsx # HeroUI → ShadCN compatibility
│   ├── lib/                 # Utility functions
│   │   ├── utils.ts         # cn() class merger
│   │   └── variants.ts      # Color variant definitions
│   ├── [component]/         # HeroUI component wrappers
│   └── index.ts             # Unified export system
```

## Best Practices

### Component Selection
```typescript
// ✅ Good: Choose appropriate component for use case
import { Button } from '@mimir-wallet/ui'; // ShadCN Button
import { Table } from '@mimir-wallet/ui';  // HeroUI Table

// ❌ Avoid: Mixing similar components unnecessarily
```

### Styling Consistency
```typescript
// ✅ Good: Use cn() for class merging
import { cn } from '@mimir-wallet/ui';
const className = cn("base-classes", conditionalClass, props.className);

// ✅ Good: Leverage component variants
<Button variant="ghost" size="sm" color="primary" />

// ❌ Avoid: Custom styling that breaks design system
<Button className="h-12 px-8 bg-blue-500" />
```

### Future-Proofing
```typescript
// ✅ Good: Import from unified package
import { Button, Card } from '@mimir-wallet/ui';

// ❌ Avoid: Direct library imports
import { Button } from '@heroui/button';
import { Alert } from '@shadcn/ui';
```

## Contributing

When contributing to this package:

1. **New Components**: Default to ShadCN/UI implementation
2. **Updates**: Enhance existing HeroUI components as needed
3. **Breaking Changes**: Always provide compatibility layer
4. **Testing**: Ensure both component systems work correctly

## License

Licensed under the Apache License, Version 2.0. See [LICENSE](../../LICENSE) for details.
