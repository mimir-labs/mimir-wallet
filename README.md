# Mimir Wallet

<div align="center">

![Mimir Wallet](./app/src/assets/images/logo.png)

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-blue)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3-blue)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-green)](https://nodejs.org/)
[![Yarn](https://img.shields.io/badge/Yarn-4.7-blue)](https://yarnpkg.com/)
[![GitHub Stars](https://img.shields.io/github/stars/mimir-labs/mimir-wallet.svg)](https://github.com/mimir-labs/mimir-wallet/stargazers)

**The most comprehensive enterprise-level multi-signature wallet for Polkadot ecosystem**

[🌐 Website](https://app.mimir.global) • [📖 Documentation](https://docs.mimir.global) • [🐛 Report Bug](https://github.com/mimir-labs/mimir-wallet/issues) • [💡 Request Feature](https://github.com/mimir-labs/mimir-wallet/issues)

</div>

---

## 🎯 Overview

Mimir Wallet is a state-of-the-art Progressive Web Application (PWA) designed for enterprise-grade multi-signature wallet management in the Polkadot ecosystem. Built with modern web technologies and following best practices, it provides an intuitive interface for complex blockchain operations while maintaining the highest security standards.

### 🚀 Key Highlights

- **Enterprise-Ready**: Production-grade multi-signature management with advanced security features
- **Cross-Chain Support**: Native support for Polkadot, Kusama, and all Substrate-based chains
- **Progressive Web App**: Installable app with offline capabilities and native-like experience
- **Modern Architecture**: Built with React 18, TypeScript 5.6, and Vite 6.3 for optimal performance
- **Monorepo Structure**: Scalable Turbo-powered architecture with modular packages

---

## ✨ Core Features

### 🔐 Enterprise Security
- **Multi-Signature Management**
  - Flexible M-of-N signature schemes (2/3, 3/5, custom configurations)
  - Hardware wallet integration (Ledger, Trezor)
  - Role-based access control with granular permissions
  - Secure transaction approval workflows

### 🌐 Blockchain Integration
- **Universal Substrate Support**
  - Native Polkadot and Kusama integration
  - Support for 40+ substrate-based parachains
  - Real-time chain state monitoring
  - Chopsticks integration for transaction simulation

### 💼 Professional Tools
- **Advanced Transaction Management**
  - Batch transaction processing for efficiency
  - Real-time transaction status tracking
  - Gas fee estimation and optimization
  - Transaction scheduling and automation
  - Comprehensive audit trails and history

### 🔧 Developer Experience
- **Modern Development Stack**
  - TypeScript-first development with strict type safety
  - Comprehensive React hooks for blockchain interactions
  - Modular component library with HeroUI v2
  - Extensive testing coverage with Vitest and Cypress

### 🎨 User Experience
- **Intuitive Interface**
  - Responsive design optimized for all devices
  - Dark/light theme support
  - Accessibility-first component design
  - Progressive Web App with offline capabilities

---

## 🚀 Quick Start

### Prerequisites

Ensure you have the following installed:

- **Node.js** >= 20.0.0 ([Download](https://nodejs.org/))
- **Yarn** v4.7.0+ ([Install via Corepack](https://yarnpkg.com/getting-started/install))
- **Git** ([Download](https://git-scm.com/))
- **Modern Browser** (Chrome 61+, Firefox 60+, Safari 11+, Edge 18+)

### 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mimir-labs/mimir-wallet.git
   cd mimir-wallet
   ```

2. **Enable Yarn and install dependencies**
   ```bash
   corepack enable
   yarn install
   ```

3. **Start development server**
   ```bash
   yarn dev
   ```

4. **Open your browser**
   ```
   Navigate to http://localhost:5173
   ```

### 🏗️ Production Build

```bash
# Build all packages for production
yarn build

# Preview the production build locally
cd app && yarn preview
```

---

## 📦 Monorepo Architecture

This project uses a **Turbo-powered monorepo** with the following structure:

```
mimir-wallet/
├── app/                          # Main wallet application
├── packages/
│   ├── polkadot-core/           # Blockchain integration layer
│   ├── service/                 # Service layer & data management
│   ├── ui/                      # Component library
│   └── dev/                     # Development tools & configs
├── turbo.json                   # Turbo configuration
└── package.json                 # Root workspace configuration
```

### 🏠 Main Application

**[`app/`](./app/)** - The primary Mimir Wallet application
- **Framework**: React 18.3 + TypeScript 5.6 + Vite 6.3
- **Features**: PWA support, multi-chain wallet interface, responsive design
- **Build Output**: Optimized production build with code splitting

### 📚 Core Packages

#### [`@mimir-wallet/polkadot-core`](./packages/polkadot-core/)
The foundational blockchain integration package
- **Polkadot.js API** v16.2.2 integration
- **Multi-chain API management** for Polkadot ecosystem
- **Transaction processing** with dry-run capabilities
- **Chopsticks integration** for fork simulation and testing
- **React hooks** for seamless blockchain state management

#### [`@mimir-wallet/service`](./packages/service/)
Service layer and data management
- **Client-side service architecture** with dependency injection
- **React Query integration** for efficient server state management
- **Storage management** (localStorage, sessionStorage, IndexedDB)
- **WebSocket support** for real-time blockchain updates

#### [`@mimir-wallet/ui`](./packages/ui/)
Modern React UI component library
- **HeroUI v2** based accessible components
- **Tailwind CSS v3.4** for utility-first styling
- **TypeScript-first** design system with strict typing
- **Specialized blockchain components** (Address, Balance, etc.)
- **Framer Motion** animations for enhanced UX

#### [`@mimir-wallet/dev`](./packages/dev/)
Development tooling and shared configurations
- **ESLint v9** configurations with modern rules
- **TypeScript configurations** for consistent builds
- **Build tools and utilities** for monorepo management

---

## 🛠 Technology Stack

### Frontend & UI
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.3 | UI framework with concurrent features |
| **TypeScript** | 5.6 | Type-safe development |
| **Vite** | 6.3 | Fast build tool and dev server |
| **HeroUI** | v2 | Accessible component library |
| **Tailwind CSS** | 3.4 | Utility-first styling |
| **Framer Motion** | 12.12 | Smooth animations |

### Blockchain Integration
| Technology | Version | Purpose |
|------------|---------|---------|
| **Polkadot.js API** | 16.2.2 | Substrate blockchain interaction |
| **Chopsticks** | 1.0.1 | Fork simulation for testing |
| **WalletConnect** | 2.15.1 | Cross-wallet compatibility |

### State Management & Data
| Technology | Version | Purpose |
|------------|---------|---------|
| **React Query** | Latest | Server state management |
| **Zustand** | 5.0 | Client state management |
| **React Router** | 6.28 | Client-side routing |
| **Socket.io Client** | Latest | Real-time communication |

### Build & Development
| Technology | Version | Purpose |
|------------|---------|---------|
| **Turbo** | 2.4.4 | Monorepo build system |
| **Yarn** | 4.7.0 | Package management with PnP |
| **ESLint** | 9.21 | Code linting and formatting |
| **Vitest** | 3.1.4 | Unit testing framework |
| **Cypress** | 13.13 | End-to-end testing |

### PWA & Performance
| Technology | Version | Purpose |
|------------|---------|---------|
| **Vite PWA** | 1.0.0 | Progressive Web App features |
| **Workbox** | 7.1.0 | Service worker management |
| **Chart.js** | 4.4.9 | Data visualization |

---

## 📜 Available Scripts

### 🔧 Monorepo Management
```bash
# Development
yarn dev              # Start all development servers
yarn build            # Build all packages for production
yarn check-types      # Run TypeScript checks across all packages

# Code Quality
yarn lint             # Run ESLint across all packages
yarn commit           # Create conventional commit (uses Commitizen)

# Package Management
yarn workspace <package-name> <command>  # Run command in specific workspace
```

### 🎯 Application Commands
```bash
# Navigate to app directory first: cd app/

yarn dev              # Start app development server (Vite)
yarn build            # Build app for production
yarn preview          # Preview production build
yarn check-types      # TypeScript type checking
```

### 📦 Package Development
```bash
# Navigate to specific package: cd packages/<package-name>/

yarn dev              # Start package in watch mode
yarn build            # Build package
yarn check-types      # Check TypeScript types
```

### 🧪 Testing
```bash
# Unit Testing
yarn test             # Run all unit tests
yarn test:watch       # Run tests in watch mode
yarn test:coverage    # Generate coverage report

# E2E Testing
cd app/
yarn cypress:open     # Open Cypress test runner
yarn cypress:run      # Run Cypress tests headlessly
```

---

## 🌐 Browser Support

### Production Environment
| Browser | Minimum Version | Features |
|---------|-----------------|----------|
| **Chrome** | 61+ | Full PWA support, hardware wallets |
| **Firefox** | 60+ | Full functionality |
| **Safari** | 11+ | PWA support (limited) |
| **Edge** | 18+ | Full functionality |
| **Opera** | 48+ | Full functionality |

### Development Environment
- Latest Chrome (recommended)
- Latest Firefox

### PWA Features
- ✅ **Installable**: Add to home screen on mobile/desktop
- ✅ **Offline Support**: Basic functionality without internet
- ✅ **Background Sync**: Transaction status updates
- ✅ **Push Notifications**: Transaction confirmations (when supported)

---

## 🎨 Key Features Deep Dive

### Multi-Signature Management
- **Flexible Thresholds**: Support for any M-of-N configuration
- **Member Management**: Add/remove signatories with proper governance
- **Transaction Approval**: Streamlined approval workflow with status tracking
- **Batch Operations**: Execute multiple transactions efficiently

### Cross-Chain Operations
- **Asset Management**: View and manage assets across multiple chains
- **Cross-Chain Transfers**: XCM support for inter-parachain transfers
- **Chain Switching**: Seamless switching between supported networks
- **Real-Time Updates**: Live chain state and transaction monitoring

### Security Features
- **Hardware Wallet Support**: Ledger and Trezor integration
- **Transaction Simulation**: Preview transaction effects before execution
- **Audit Trails**: Comprehensive transaction history and logs
- **Secure Storage**: Client-side key management with encryption

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Development Process

1. **Fork the repository**
   ```bash
   git clone https://github.com/<your-username>/mimir-wallet.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
   - Follow the existing code style and conventions
   - Add tests for new functionality
   - Update documentation as needed

4. **Commit using Conventional Commits**
   ```bash
   yarn commit  # Uses Commitizen for proper formatting
   ```

5. **Push and create a Pull Request**
   ```bash
   git push origin feature/amazing-feature
   ```

### Code Standards

- **TypeScript**: Strict type checking enabled
- **ESLint**: Enforced code style and best practices
- **Prettier**: Automatic code formatting
- **Conventional Commits**: Standardized commit messages
- **Testing**: Unit tests required for new features

### Areas for Contribution

- 🐛 **Bug Fixes**: Help us identify and fix issues
- ✨ **New Features**: Propose and implement new wallet features
- 📖 **Documentation**: Improve guides and API documentation
- 🧪 **Testing**: Increase test coverage and add E2E tests
- 🎨 **UI/UX**: Enhance user interface and experience
- 🔧 **Performance**: Optimize bundle size and runtime performance

---

## 📄 License

This project is licensed under the **Apache License 2.0** - see the [LICENSE](LICENSE) file for details.

---

## 🔗 Links & Resources

### Official Links
- 🌐 **Website**: [mimir.global](https://www.mimir.global)
- 📖 **Documentation**: [docs.mimir.global](https://docs.mimir.global)
- 📱 **GitHub**: [mimir-labs/mimir-wallet](https://github.com/mimir-labs/mimir-wallet)
- 🐛 **Issues**: [Bug Reports & Feature Requests](https://github.com/mimir-labs/mimir-wallet/issues)

### Community & Support
- 💬 **Telegram**: [Join our community](https://t.me/+t7vZ1kXV5h1kNGQ9)
- 🐦 **Twitter**: [@Mimir_global](https://twitter.com/Mimir_global)

### Development Resources
- 📦 **Releases**: [GitHub Releases](https://github.com/mimir-labs/mimir-wallet/releases)

---

<div align="center">

**Made with ❤️ by [Mimir Labs](https://mimir.global)**

⭐ Star us on GitHub if you find this project useful!

</div>
