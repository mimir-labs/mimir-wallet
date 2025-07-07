# @mimir-wallet/ui

A modern, accessible React UI component library built specifically for Mimir Wallet, based on HeroUI with custom enhancements for blockchain applications.

## Overview

This package provides a comprehensive set of React components designed for building intuitive and accessible blockchain applications. Built on top of HeroUI, it offers both fundamental UI primitives and specialized components for wallet interfaces.

## Features

### 🎨 Modern Design System
- **HeroUI Foundation** - Built on the robust HeroUI component system
- **Tailwind CSS Integration** - Utility-first CSS framework for rapid styling
- **Dark/Light Theme Support** - Automatic theme switching with system preference
- **Responsive Design** - Mobile-first responsive components

### ♿ Accessibility First
- **WAI-ARIA Compliant** - Full accessibility support with proper ARIA attributes
- **Keyboard Navigation** - Complete keyboard navigation support
- **Screen Reader Friendly** - Optimized for assistive technologies
- **Focus Management** - Proper focus handling and visual indicators

### 🧩 Comprehensive Components
- **Form Controls** - Inputs, selects, checkboxes, switches
- **Navigation** - Tabs, dropdowns, menus
- **Feedback** - Alerts, modals, tooltips, toasts
- **Data Display** - Tables, cards, badges, avatars
- **Layout** - Drawers, dividers, scroll shadows

### 🔧 Developer Experience
- **TypeScript First** - Full TypeScript support with comprehensive type definitions
- **Tree Shaking** - Optimized bundle size with tree-shakeable exports
- **Custom Hooks** - Powerful hooks for common UI interactions
- **Flexible Styling** - Easy customization with CSS variables and Tailwind

## Installation

This package is part of the Mimir Wallet monorepo and is typically not installed separately. However, if you need to use it in your own project:

```bash
yarn add @mimir-wallet/ui
```

### Peer Dependencies

```bash
yarn add react-router-dom
```

## Setup

### Import Styles

Import the component styles in your application:

```typescript
import '@mimir-wallet/ui/styles.css';
```

### Provider Setup

Wrap your application with the HeroUI provider:

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

## Usage

### Basic Components

```typescript
import { Button, Input, Card, CardBody } from '@mimir-wallet/ui';

function LoginForm() {
  return (
    <Card className="max-w-md mx-auto">
      <CardBody className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="Enter your email"
        />
        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
        />
        <Button color="primary" className="w-full">
          Sign In
        </Button>
      </CardBody>
    </Card>
  );
}
```

### Advanced Components

```typescript
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell
} from '@mimir-wallet/ui';

function TransactionModal({ isOpen, onClose, transactions }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalContent>
        <ModalHeader>Transaction History</ModalHeader>
        <ModalBody>
          <Table>
            <TableHeader>
              <TableColumn>Hash</TableColumn>
              <TableColumn>Amount</TableColumn>
              <TableColumn>Status</TableColumn>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>{tx.hash}</TableCell>
                  <TableCell>{tx.amount}</TableCell>
                  <TableCell>{tx.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
```

### Custom Hooks

```typescript
import { usePress, useHover, useFocus } from '@mimir-wallet/ui';

function InteractiveComponent() {
  const { pressProps, isPressed } = usePress({
    onPress: () => console.log('Pressed!')
  });

  const { hoverProps, isHovered } = useHover({
    onHoverStart: () => console.log('Hover started')
  });

  const { focusProps, isFocused } = useFocus({
    onFocus: () => console.log('Focused')
  });

  return (
    <div
      {...pressProps}
      {...hoverProps}
      {...focusProps}
      className={`p-4 rounded ${isPressed ? 'bg-blue-200' : isHovered ? 'bg-gray-100' : ''}`}
    >
      Interactive Element
    </div>
  );
}
```

## Component Reference

### Form Components

#### Button
Versatile button component with multiple variants and states.

```typescript
<Button
  color="primary"
  variant="solid"
  size="md"
  isLoading={false}
  isDisabled={false}
  onPress={() => {}}
>
  Click Me
</Button>
```

#### Input
Flexible input component with built-in validation.

```typescript
<Input
  label="Username"
  placeholder="Enter username"
  type="text"
  isRequired
  errorMessage="Username is required"
/>
```

#### Select
Accessible select component with search capabilities.

```typescript
<Select
  label="Choose option"
  placeholder="Select an option"
>
  <SelectItem key="option1" value="option1">Option 1</SelectItem>
  <SelectItem key="option2" value="option2">Option 2</SelectItem>
</Select>
```

### Layout Components

#### Card
Container component for grouping related content.

```typescript
<Card>
  <CardHeader>
    <h3>Card Title</h3>
  </CardHeader>
  <CardBody>
    <p>Card content goes here</p>
  </CardBody>
</Card>
```

#### Modal
Accessible modal dialog component.

```typescript
<Modal isOpen={isOpen} onClose={onClose}>
  <ModalContent>
    <ModalHeader>Modal Title</ModalHeader>
    <ModalBody>Modal content</ModalBody>
    <ModalFooter>Modal actions</ModalFooter>
  </ModalContent>
</Modal>
```

### Data Display

#### Table
Flexible data table with sorting and selection.

```typescript
<Table>
  <TableHeader>
    <TableColumn>Name</TableColumn>
    <TableColumn>Email</TableColumn>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>John Doe</TableCell>
      <TableCell>john@example.com</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

## Styling & Customization

### Tailwind Configuration

The package includes a Tailwind plugin for HeroUI:

```javascript
// tailwind.config.js
module.exports = {
  plugins: [
    require('@mimir-wallet/ui/hero-plugin')
  ]
};
```

### CSS Variables

Customize theme colors with CSS variables:

```css
:root {
  --heroui-primary: 220 78% 60%;
  --heroui-secondary: 220 13% 69%;
  --heroui-success: 142 71% 45%;
  --heroui-warning: 38 92% 50%;
  --heroui-danger: 0 84% 60%;
}
```

### Custom Variants

Create custom component variants:

```typescript
import { button } from '@heroui/theme';

const customButton = button({
  variants: {
    color: {
      custom: "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
    }
  }
});
```

## Architecture

```
@mimir-wallet/ui/
├── src/
│   ├── alert/               # Alert components
│   ├── button/              # Button components
│   ├── checkbox/            # Checkbox components
│   ├── input/               # Input components
│   ├── modal/               # Modal components
│   ├── table/               # Table components
│   ├── tabs/                # Tab components
│   └── styles.css           # Global styles
└── hero-plugin.js           # Tailwind plugin
```

## Best Practices

### Composition Over Inheritance

Build complex components by composing simpler ones:

```typescript
function WalletCard({ wallet }) {
  return (
    <Card>
      <CardBody className="flex items-center space-x-4">
        <Avatar src={wallet.avatar} name={wallet.name} />
        <div>
          <h3 className="font-semibold">{wallet.name}</h3>
          <p className="text-small text-default-500">{wallet.address}</p>
        </div>
        <Badge color="success">{wallet.balance} DOT</Badge>
      </CardBody>
    </Card>
  );
}
```

### Accessibility

Always provide proper accessibility attributes:

```typescript
<Button
  aria-label="Close modal"
  aria-describedby="close-description"
  onPress={onClose}
>
  ×
</Button>
<div id="close-description" className="sr-only">
  Click to close the modal dialog
</div>
```

### Performance

Use React.memo for expensive components:

```typescript
import React from 'react';

const ExpensiveComponent = React.memo(({ data }) => {
  // Complex rendering logic
  return <div>{/* content */}</div>;
});
```

## TypeScript Support

Full TypeScript support with comprehensive type definitions:

- Component prop types
- Event handler types
- Theme customization types
- Generic component support

```typescript
interface CustomSelectProps<T> {
  items: T[];
  keyExtractor: (item: T) => string;
  labelExtractor: (item: T) => string;
}

function CustomSelect<T>({ items, keyExtractor, labelExtractor }: CustomSelectProps<T>) {
  return (
    <Select>
      {items.map((item) => (
        <SelectItem key={keyExtractor(item)} value={keyExtractor(item)}>
          {labelExtractor(item)}
        </SelectItem>
      ))}
    </Select>
  );
}
```

## Contributing

This package is part of the Mimir Wallet monorepo. Please see the main [Contributing Guide](../../README.md#contributing) for details.

## License

Licensed under the Apache License, Version 2.0. See [LICENSE](../../LICENSE) for details.
