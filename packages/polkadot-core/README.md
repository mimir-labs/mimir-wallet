# @mimir-wallet/polkadot-core

Core blockchain integration package for Mimir Wallet, providing APIs and React hooks for Polkadot and Substrate-based chains.

## Features

- **Multi-chain API Management** - Connection pooling with automatic reconnection
- **Transaction Processing** - Call filtering, fee estimation, batch operations
- **Dry-run Simulation** - Chopsticks integration for transaction preview
- **React Hooks** - `useChains`, `useChainStatus`, `useApiStore` and more

## Installation

```bash
pnpm add @mimir-wallet/polkadot-core
```

### Peer Dependencies

```bash
pnpm add react zustand @polkadot/api @polkadot/types
```

## Usage

```typescript
import {
  NetworkProvider,
  useChains,
  useApiStore,
  initializeApiStore,
} from '@mimir-wallet/polkadot-core';

// Initialize API store
await initializeApiStore();

// Wrap your app with NetworkProvider
function App() {
  return (
    <NetworkProvider>
      <WalletComponent />
    </NetworkProvider>
  );
}

// Use hooks in components
function WalletComponent() {
  const { chains } = useChains();
  const { getApi } = useApiStore();

  // Get API for a specific chain
  const api = getApi('polkadot');
  const tx = api?.tx.balances.transferKeepAlive(recipient, amount);
}
```

### Dry-run Simulation

```typescript
import { dryRun, parseBalancesChange } from '@mimir-wallet/polkadot-core';

const result = await dryRun(api, tx, signer);
const balanceChanges = parseBalancesChange(result);
```

## Testing

```bash
pnpm test              # Unit tests
pnpm test:integration  # Integration tests (Paseo testnet)
```

## License

[Apache License 2.0](../../LICENSE)
