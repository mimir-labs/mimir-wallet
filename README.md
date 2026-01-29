# Mimir Wallet

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![GitHub Stars](https://img.shields.io/github/stars/mimir-labs/mimir-wallet.svg)](https://github.com/mimir-labs/mimir-wallet/stargazers)
[![Node.js](https://img.shields.io/badge/Node.js-22%2B-green)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)

Enterprise-grade multi-signature wallet for the Polkadot ecosystem. Built as a Progressive Web App with React, TypeScript, and Vite.

**[Live Demo](https://app.mimir.global)** · [Documentation](https://docs.mimir.global) · [Report Bug](https://github.com/mimir-labs/mimir-wallet/issues)

## Features

- **Multi-Signature Management** - Flexible M-of-N signature schemes with hardware wallet support (Ledger)
- **Cross-Chain Operations** - XCM transfers across 40+ Polkadot parachains
- **Transaction Simulation** - Preview transaction effects with Chopsticks integration
- **Progressive Web App** - Installable with offline capabilities
- **Batch Transactions** - Execute multiple operations efficiently

## Quick Start

```bash
# Clone repository
git clone https://github.com/mimir-labs/mimir-wallet.git
cd mimir-wallet

# Install dependencies (requires Node.js 22+ and pnpm 10+)
corepack enable
pnpm install

# Start development server
pnpm dev
```

Open http://localhost:5173 in your browser.

## Project Structure

```
mimir-wallet/
├── app/                      # Main wallet application (React + Vite PWA)
├── packages/
│   ├── polkadot-core/        # Blockchain integration (Polkadot.js API, Chopsticks)
│   ├── service/              # HTTP client, React Query, WebSocket
│   ├── ui/                   # ShadCN/UI component library
│   └── dev/                  # ESLint, TypeScript configs
```

## Tech Stack

**Frontend**: React, TypeScript, Vite, Tailwind CSS, ShadCN/UI
**Blockchain**: Polkadot.js API, Chopsticks, WalletConnect
**State**: TanStack Query, Zustand, TanStack Router
**Build**: Turbo, pnpm, Vitest

## Development

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm check-types  # TypeScript check
pnpm lint         # ESLint
pnpm test         # Run tests
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit using conventional commits (`pnpm commit`)
4. Open a Pull Request

## Community

- [Telegram](https://t.me/+t7vZ1kXV5h1kNGQ9)
- [Twitter](https://twitter.com/Mimir_global)

## License

[Apache License 2.0](LICENSE)
