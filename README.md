# Mimir Wallet

<div align="center">

![Mimir Wallet](./src/assets/images/logo.png)

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-blue)](https://vitejs.dev/)
[![GitHub Stars](https://img.shields.io/github/stars/mimir-labs/mimir-wallet.svg)](https://github.com/mimir-labs/mimir-wallet/stargazers)

The most comprehensive enterprise-level multi-signature account (multisig) management tool for Polkadot, Kusama, and other substrate-based chains.

[Website](https://app.mimir.global) · [Documentation](https://docs.mimir.global) · [Report Bug](https://github.com/mimir-labs/mimir-wallet/issues) · [Request Feature](https://github.com/mimir-labs/mimir-wallet/issues)

</div>

## 🎯 Overview

Mimir Wallet is a state-of-the-art multisig wallet solution designed specifically for the Polkadot ecosystem. It combines enterprise-grade security with an intuitive user interface, making complex multisig operations simple and secure.

## ✨ Key Features

### 🔐 Enterprise-Grade Security
- **Advanced Multi-signature Management**
  - Customizable M-of-N signature schemes
  - Role-based access control
  - Flexible threshold configurations
  - Hardware wallet integration

### 🌐 Cross-Chain Capabilities
- **Comprehensive Network Support**
  - Polkadot ecosystem integration
  - Support for all substrate-based chains
  - Cross-chain asset management
  - Unified transaction interface

### 💼 Professional Tools
- **Transaction Management**
  - Real-time transaction monitoring
  - Batch transaction processing
  - Transaction scheduling
  - Gas fee optimization
  - Detailed audit logs

### 🚀 Modern Architecture
- **Technical Excellence**
  - Progressive Web App (PWA)
  - Real-time WebSocket updates
  - Responsive Material UI design
  - TypeScript type safety
  - Modular architecture

### 🔌 Integration & Extensions
- **Developer Ecosystem**
  - Comprehensive SDK
  - DApp integration support
  - API documentation

### 🛡️ Compliance & Governance
- **Enterprise Features**
  - Multi-team support
  - Transaction approval workflows
  - Transaction activity trails

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20
- Yarn v4.5.3 or later
- Git
- A modern web browser (see [Browser Support](#-browser-support))

### Installation

1. Clone the repository
```bash
git clone https://github.com/mimir-labs/mimir-wallet.git
cd mimir-wallet
```

2. Install dependencies
```bash
corepack enable  # Enable Yarn
yarn install
```

3. Start development server
```bash
yarn dev
```

The app will be available at http://localhost:5173

### Production Deployment

```bash
yarn build      # Build for production
yarn preview    # Preview production build locally
```


## 🛠 Technology Stack

- **Frontend Framework**
  - React 18
  - TypeScript 5
  - Material UI v6

- **Build Tools**
  - Vite
  - ESBuild

- **State Management & Data Fetching**
  - React Query
  - React Router
  - Polkadot.js API

- **Real-time Communication**
  - Socket.io

## 📦 Available Scripts

```bash
# Development
yarn dev          # Start development server
yarn build        # Build for production
yarn preview      # Preview production build

# Testing
yarn test         # Run unit tests
yarn test:e2e     # Run end-to-end tests
yarn validate     # Run all tests and validations

# Code Quality
yarn lint         # Run ESLint
yarn type-check   # Run TypeScript checks
yarn commit       # Create a conventional commit
```

## 🌐 Browser Support

### Production Environment
- Chrome >= 61
- Firefox >= 60
- Safari >= 11
- Edge >= 18
- Opera >= 48

### Development Environment
- Latest Chrome
- Latest Firefox

## 🤝 Contributing

We love your input! We want to make contributing to Mimir Wallet as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

### Development Process

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes using Commitizen (`yarn commit`)
4. Push to your branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- We use Prettier for code formatting
- Follow the TypeScript guidelines
- Write meaningful commit messages using Conventional Commits

See our [Contributing Guide](CONTRIBUTING.md) for detailed information.

## 📄 License

Licensed under the Apache License, Version 2.0 - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Website](https://app.mimir.global)
- [Documentation](https://docs.mimir.global)
- [GitHub Repository](https://github.com/mimir-labs/mimir-wallet)
- [Issue Tracker](https://github.com/mimir-labs/mimir-wallet/issues)
- [Changelog](CHANGELOG.md)


<div align="center">

Made with ❤️ by [Mimir Labs](https://mimir.global)

</div>
