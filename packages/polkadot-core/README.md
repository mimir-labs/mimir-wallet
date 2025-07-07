# @mimir-wallet/polkadot-core

The core Polkadot blockchain integration package for Mimir Wallet, providing essential APIs, utilities, and React hooks for interacting with Polkadot and substrate-based chains.

## Overview

This package serves as the foundational layer for Polkadot ecosystem integration within Mimir Wallet. It abstracts the complexity of blockchain interactions while providing a robust, type-safe interface for building multisig wallet applications.

## Features

### 🔗 API Management
- **Multi-chain API initialization** - Support for Polkadot, Kusama, and all substrate-based chains
- **Connection pooling** - Efficient management of multiple network connections
- **Automatic reconnection** - Resilient connections with automatic retry logic
- **RPC endpoint management** - Configurable RPC endpoints with failover support

### 🔧 Transaction Processing
- **Call filtering** - Advanced transaction call filtering and validation
- **Dry-run capabilities** - Simulate transactions before execution
- **Fee estimation** - Accurate transaction fee calculation
- **Batch operations** - Support for batch transaction processing

### 🎯 Simulation & Testing
- **Chopsticks integration** - Fork simulation for testing
- **Balance change analysis** - Detailed balance impact analysis
- **Event parsing** - Comprehensive transaction event handling

### ⚛️ React Integration
- **Custom hooks** - Purpose-built React hooks for common operations
- **Context providers** - Clean state management with React context
- **Type safety** - Full TypeScript support with auto-generated types

## Installation

This package is part of the Mimir Wallet monorepo and is typically not installed separately. However, if you need to use it in your own project:

```bash
yarn add @mimir-wallet/polkadot-core
```

### Peer Dependencies

```bash
yarn add react react-dom zustand @polkadot/api @polkadot/types @polkadot/util
```

## Usage

### Basic Setup

```typescript
import { initializeApi, ApiRoot } from '@mimir-wallet/polkadot-core';

// Initialize API for a specific network
const api = await initializeApi('polkadot');

// Use in React components
function App() {
  return (
    <ApiRoot>
      <YourComponents />
    </ApiRoot>
  );
}
```

### Using React Hooks

```typescript
import { useApi, useAllApis, useNetworks } from '@mimir-wallet/polkadot-core';

function WalletComponent() {
  const api = useApi(); // Get current API instance
  const allApis = useAllApis(); // Get all connected APIs
  const networks = useNetworks(); // Get available networks

  // Your component logic
}
```

### Transaction Calls

```typescript
import { createCall, buildTx } from '@mimir-wallet/polkadot-core';

// Create a transaction call
const call = createCall(api, 'balances', 'transfer', [recipient, amount]);

// Build and submit transaction
const tx = await buildTx(api, call, signer);
```

### Dry-run Simulation

```typescript
import { dryRun, parseBalancesChange } from '@mimir-wallet/polkadot-core';

// Simulate transaction execution
const result = await dryRun(api, tx, signer);
const balanceChanges = parseBalancesChange(result);
```

## API Reference

### Core Functions

#### `initializeApi(network: string): Promise<ApiPromise>`
Initialize API connection to a specific network.

#### `createApi(endpoint: string): Promise<ApiPromise>`
Create API instance for custom endpoint.

### React Hooks

#### `useApi(): ApiPromise | null`
Get the current API instance for the active network.

#### `useAllApis(): Record<string, ApiPromise>`
Get all initialized API instances mapped by network name.

#### `useNetworks(): Network[]`
Get list of all available networks and their configurations.

#### `useIdentityApi(): ApiPromise | null`
Get API instance specifically for identity operations.

### Utilities

#### `encodeAddress(address: string, ss58Format?: number): string`
Encode address to specific SS58 format.

#### `decodeAddress(address: string): Uint8Array`
Decode SS58 address to raw bytes.

## Configuration

### Network Configuration

Networks are configured in the `config.ts` file:

```typescript
export const networks: Network[] = [
  {
    id: 'polkadot',
    name: 'Polkadot',
    endpoints: ['wss://rpc.polkadot.io'],
    ss58Format: 0,
    // ... other config
  }
];
```

### Custom Endpoints

You can add custom RPC endpoints:

```typescript
import { allEndpoints } from '@mimir-wallet/polkadot-core';

// Add custom endpoint
allEndpoints.push({
  name: 'Custom Network',
  url: 'wss://custom-rpc.example.com'
});
```

## Architecture

```
@mimir-wallet/polkadot-core/
├── src/
│   ├── api/                 # API management
│   ├── call/                # Transaction calls
│   ├── dry-run/             # Simulation functionality
│   ├── simulate/            # Advanced simulation
│   ├── hooks/               # React hooks
│   ├── config/              # Network configurations
│   └── utils/               # Utility functions
```

## TypeScript Support

This package includes comprehensive TypeScript definitions:

- Auto-generated types from Polkadot API
- Custom type augmentations for substrate chains
- Full type safety for all operations

## Contributing

This package is part of the Mimir Wallet monorepo. Please see the main [Contributing Guide](../../README.md#contributing) for details.

## License

Licensed under the Apache License, Version 2.0. See [LICENSE](../../LICENSE) for details.