# @mimir-wallet/service

A comprehensive service layer package for Mimir Wallet, providing client-side services, data fetching, storage management, and real-time communication capabilities.

## Overview

This package implements the service layer architecture for Mimir Wallet, offering a clean abstraction over complex backend operations. It includes client service management, query handling, storage solutions, and WebSocket-based real-time updates.

## Features

### 🔌 Client Service Management
- **Centralized service architecture** - Clean abstraction for backend communications
- **Configuration management** - Flexible configuration for different environments
- **Service lifecycle** - Proper initialization and cleanup

### 📊 Data Fetching & Caching
- **React Query integration** - Powerful data fetching with automatic caching
- **Custom hooks** - Purpose-built hooks for common data operations
- **Error handling** - Comprehensive error handling and retry logic
- **Optimistic updates** - Smooth UX with optimistic UI updates

### 💾 Storage Solutions
- **Multiple storage backends** - Local storage, session storage support
- **Type-safe storage** - TypeScript-first storage APIs
- **Storage utilities** - Helper functions for common storage operations
- **Data persistence** - Reliable data persistence across sessions

### 🔄 Real-time Communication
- **WebSocket integration** - Real-time updates via Socket.io
- **Connection management** - Automatic reconnection and error recovery
- **Event handling** - Structured event handling system
- **Context providers** - React context for socket state management

## Installation

This package is part of the Mimir Wallet monorepo and is typically not installed separately. However, if you need to use it in your own project:

```bash
yarn add @mimir-wallet/service
```

### Peer Dependencies

```bash
yarn add react react-dom
```

## Usage

### Service Initialization

```typescript
import { initService, service } from '@mimir-wallet/service';

// Initialize service with gateway URL
initService('https://api.mimir.global');

// Use service instance
const result = await service.someMethod();
```

### React Query Integration

```typescript
import { QueryProvider } from '@mimir-wallet/service';
import { QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryProvider client={queryClient}>
      <YourComponents />
    </QueryProvider>
  );
}
```

### Using Custom Hooks

```typescript
import { useClientQuery, useStore } from '@mimir-wallet/service';

function DataComponent() {
  // Fetch data with automatic caching
  const { data, isLoading, error } = useClientQuery({
    queryKey: ['user-data'],
    queryFn: () => service.getUserData()
  });

  // Use local storage
  const [value, setValue] = useStore('my-key', 'default-value');

  return (
    <div>
      {isLoading ? 'Loading...' : data}
    </div>
  );
}
```

### Storage Management

```typescript
import { LocalStore, SessionStorage } from '@mimir-wallet/service';

// Local storage operations
const localStore = new LocalStore('my-namespace');
localStore.set('key', { some: 'data' });
const data = localStore.get('key');

// Session storage operations
const sessionStore = new SessionStorage();
sessionStore.setItem('temp-data', JSON.stringify(value));
```

### WebSocket Integration

```typescript
import { SocketProvider, useSocket } from '@mimir-wallet/service';

function App() {
  return (
    <SocketProvider url="wss://api.mimir.global">
      <SocketComponent />
    </SocketProvider>
  );
}

function SocketComponent() {
  const socket = useSocket();

  useEffect(() => {
    socket?.on('update', (data) => {
      console.log('Received update:', data);
    });

    return () => {
      socket?.off('update');
    };
  }, [socket]);

  return <div>Socket Status: {socket?.connected ? 'Connected' : 'Disconnected'}</div>;
}
```

## API Reference

### Core Services

#### `initService(clientGateway: string): void`
Initialize the service with the provided gateway URL.

#### `service: ClientService`
Global service instance for making API calls.

### Storage

#### `LocalStore`
Type-safe local storage wrapper with namespace support.

```typescript
class LocalStore {
  constructor(namespace?: string);
  set<T>(key: string, value: T): void;
  get<T>(key: string): T | null;
  remove(key: string): void;
  clear(): void;
}
```

#### `SessionStorage`
Session storage implementation.

```typescript
class SessionStorage {
  setItem(key: string, value: string): void;
  getItem(key: string): string | null;
  removeItem(key: string): void;
  clear(): void;
}
```

### React Hooks

#### `useClientQuery<T>(options: QueryOptions<T>): QueryResult<T>`
Enhanced React Query hook with service integration.

#### `useStore<T>(key: string, defaultValue: T): [T, (value: T) => void]`
Hook for managing local storage state.

### WebSocket

#### `SocketProvider`
React context provider for WebSocket connections.

#### `useSocket(): Socket | null`
Hook to access the current socket instance.

## Configuration

### Client Configuration

Configure the service client:

```typescript
import { ClientService } from '@mimir-wallet/service';

const service = ClientService.create('https://api.mimir.global', {
  timeout: 10000,
  retries: 3,
  headers: {
    'Authorization': 'Bearer token'
  }
});
```

### Query Configuration

Configure React Query defaults:

```typescript
import { QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 3
    }
  }
});
```

## Architecture

```
@mimir-wallet/service/
├── src/
│   ├── client-service/      # Service layer implementation
│   ├── hooks/               # React hooks
│   ├── query/               # React Query integration
│   ├── socket/              # WebSocket management
│   ├── store/               # Storage solutions
│   └── config.ts            # Configuration
```

## Error Handling

The package provides comprehensive error handling:

```typescript
import { FetchError, NetworkError } from '@mimir-wallet/service';

try {
  const result = await service.someMethod();
} catch (error) {
  if (error instanceof FetchError) {
    // Handle fetch-specific errors
  } else if (error instanceof NetworkError) {
    // Handle network errors
  }
}
```

## Best Practices

### Query Keys

Use consistent query key patterns:

```typescript
const queryKeys = {
  user: (id: string) => ['user', id],
  transactions: (address: string) => ['transactions', address],
  balance: (address: string, chain: string) => ['balance', address, chain]
};
```

### Storage Namespacing

Use namespaced storage to avoid conflicts:

```typescript
const userStore = new LocalStore('user');
const settingsStore = new LocalStore('settings');
```

### Error Boundaries

Wrap components with error boundaries for better UX:

```typescript
import { ErrorBoundary } from 'react-error-boundary';

function App() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <ServiceProvider>
        <YourApp />
      </ServiceProvider>
    </ErrorBoundary>
  );
}
```

## TypeScript Support

Full TypeScript support with:

- Type-safe service methods
- Generic storage operations
- Strongly typed query results
- Proper error type definitions

## Contributing

This package is part of the Mimir Wallet monorepo. Please see the main [Contributing Guide](../../README.md#contributing) for details.

## License

Licensed under the Apache License, Version 2.0. See [LICENSE](../../LICENSE) for details.
