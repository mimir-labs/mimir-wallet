# Mimir Wallet

The best enterprise-level multi-signature account (multisig) management tool for Polkadot, Kusama, and other substrate-based chains.

## Features

- 🔐 Advanced Multi-signature Account Management
- 🌐 Cross-chain Support (Polkadot, Kusama, and other substrate chains)
- 📱 Progressive Web App (PWA) Support
- 🎨 Modern Material UI Design
- ⚡ Built with React and Vite
- 🔄 Real-time Transaction Monitoring
- 📊 Transaction History and Explorer
- 📘 Address Book Management
- 🔗 DApp Integration Support

## Tech Stack

- React 18
- TypeScript
- Vite
- Material UI v6
- Polkadot.js API
- React Query
- React Router
- TailwindCSS
- Socket.io for real-time updates

## Prerequisites

- Node.js >= 20
- Yarn package manager (v4.5.3 or later)

## Development

1. Clone the repository:

```bash
git clone https://github.com/mimir-labs/mimir-wallet.git
cd mimir-wallet
```

2. Install dependencies:

```bash
yarn install
```

3. Start the development server:

```bash
yarn dev
```

The app will be available at http://localhost:5173

## Building for Production

To create a production build:

```bash
yarn build
```

To preview the production build:

```bash
yarn preview
```

## Testing

- Run unit tests:

```bash
yarn test
```

- Run E2E tests:

```bash
yarn test:e2e
```

- Run all tests and validation:

```bash
yarn validate
```

## Code Quality

The project uses several tools to maintain code quality:

- ESLint for code linting
- TypeScript for type checking
- Husky for git hooks
- Commitizen for conventional commits

To run linting:

```bash
yarn lint
```

## Browser Support

### Production

- Edge >= 18
- Firefox >= 60
- Chrome >= 61
- Safari >= 11
- Opera >= 48

### Development

- Latest Chrome
- Latest Firefox

## License

Licensed under the Apache License, Version 2.0

## Links

- Homepage: https://app.mimir.global
- Repository: https://github.com/mimir-labs/mimir-wallet
- Issue Tracker: https://github.com/mimir-labs/mimir-wallet/issues

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes using Commitizen (`yarn commit`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

Made with ❤️ by mimir team
