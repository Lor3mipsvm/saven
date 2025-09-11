<p align="center">
  <a href="https://github.com/pooltogether/pooltogether--brand-assets">
    <img src="https://github.com/pooltogether/pooltogether--brand-assets/blob/977e03604c49c63314450b5d432fe57d34747c66/logo/pooltogether-logo--purple-gradient.png?raw=true" alt="PoolTogether Brand" style="max-width:100%;" width="200">
  </a>
</p>

<br />

# 💻 &nbsp; Saven - PoolTogether Cabana Fork

This monorepo includes Saven's fork of PoolTogether's Cabana Base miniapp, featuring a custom landing page and enhanced deposit functionality with zap support.

## 💾 &nbsp; Installation

Make sure you have [pnpm](https://pnpm.io/) installed, as it is the package manager used throughout this monorepo.

`pnpm i`

## 🏎️ &nbsp; Quickstart

### Development

To run all apps simultaneously:
```bash
pnpm dev
```

To run individual apps:
```bash
# Main Saven App (port 3000)
cd apps/app && pnpm dev

# Landing Page (port 3001)
cd apps/landing && pnpm dev
```

---

### Apps

- **`app`**: Main Saven application with enhanced deposit functionality, zap support, and Saven branding
  - Runs on `http://localhost:3000`
  - Features vault selection, deposit modal with zap functionality
  - Integrated with Dynamic Labs wallet connection
  - Supports multiple deposit assets via ParaSwap routing

- **`landing`**: Saven landing page with animated hero section
  - Runs on `http://localhost:3001`
  - Features rotating crypto asset display (BTC, ETH, USD)
  - Links to main app via "Open App" button
  - Responsive design with glass morphism effects

Both apps are [Next.js](https://nextjs.org/) applications with [Tailwind CSS](https://tailwindcss.com/) support, written in [TypeScript](https://www.typescriptlang.org/).

## ✨ &nbsp; Key Features

### Saven App Enhancements
- **Smart Vault Selection**: Automatically selects highest-yielding vault per asset category
- **Zap Functionality**: Deposit any supported token via ParaSwap routing
- **Enhanced UI**: Saven-branded deposit modal with improved styling
- **Wallet Integration**: Dynamic Labs wallet connection with Base chain support
- **Asset Support**: ETH, BTC, USD exposure with multiple token options

### Landing Page
- **Animated Hero**: Rotating crypto asset display (BTC, ETH, USD)
- **Glass Morphism**: Modern UI with backdrop blur effects
- **Responsive Design**: Mobile-first approach with smooth animations
- **Direct Integration**: Seamless navigation to main app

---

### Utilities

This Turborepo has some additional tools already setup:

- [Tailwind CSS](https://tailwindcss.com/) for styles
- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [Prettier](https://prettier.io) for code formatting

---

### Known Issues / Fixes

When adding/updating apps and/or packages, duplicate dependencies may be created, creating versioning issues. This can be resolved through running `pnpm up -r` as described [here](https://github.com/pnpm/pnpm/issues/2443), or just looking through `pnpm-lock.yaml` to identify version discrepancies.

The biggest culprit of the above is `@tanstack/react-query`, which sometimes is installed as two different versions and apps can no longer utilize hooks from the hooks package. This has been solved through the method described [here](https://github.com/TanStack/query/issues/3595#issuecomment-1248074333).

If editing component themes in `ui`, having the `Tailwind CSS IntelliSense` plugin for VSCode is recommended. In order to enable it for custom Flowbite themes and string class names, add `theme` and `.*ClassName*` to the `Class Attributes` setting.

Currently, `lottie-react` has some SSR issues in Node v22 as seen [here](https://github.com/Gamote/lottie-react/issues/101). Downgrading your node version to v18 resolves this issue.
