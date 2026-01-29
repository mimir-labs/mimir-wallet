# @mimir-wallet/service

Service layer for Mimir Wallet, providing HTTP client, data fetching, storage, and real-time communication.

## Features

- **Client Service** - Centralized HTTP client with configuration management
- **React Query** - Data fetching with automatic caching and error handling
- **Storage** - Type-safe localStorage and sessionStorage wrappers
- **WebSocket** - Real-time updates via Socket.io

## Installation

```bash
pnpm add @mimir-wallet/service
```

## Usage

### Service Initialization

```typescript
import { initService, service } from '@mimir-wallet/service';

initService('https://api.mimir.global');
const data = await service.getAccountInfo(address);
```

### React Query

```typescript
import { QueryProvider } from '@mimir-wallet/service';

function App() {
  return (
    <QueryProvider>
      <YourComponents />
    </QueryProvider>
  );
}
```

### Storage

```typescript
import { store } from '@mimir-wallet/service';

store.set('key', { data: 'value' });
const data = store.get('key');
```

### WebSocket

```typescript
import { TransactionSocketProvider, useSocket } from '@mimir-wallet/service';

function App() {
  return (
    <TransactionSocketProvider>
      <SocketComponent />
    </TransactionSocketProvider>
  );
}

function SocketComponent() {
  const socket = useSocket();

  useEffect(() => {
    socket?.on('update', (data) => console.log(data));
    return () => socket?.off('update');
  }, [socket]);
}
```

## License

[Apache License 2.0](../../LICENSE)
