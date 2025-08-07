<p align="center">
  <a href="https://github.com/pooltogether/pooltogether--brand-assets">
    <img src="https://github.com/pooltogether/pooltogether--brand-assets/blob/977e03604c49c63314450b5d432fe57d34747c66/logo/pooltogether-logo--purple-gradient.png?raw=true" alt="PoolTogether Brand" style="max-width:100%;" width="200">
  </a>
</p>

<br />

# 💻 &nbsp; PoolTogether Cabana World Monorepo

This monorepo includes the deploy of PoolTogether's Cabana Base miniapp.

## 💾 &nbsp; Installation

Make sure you have [pnpm](https://pnpm.io/) installed, as it is the package manager used throughout this monorepo.

`pnpm i`

## 🏎️ &nbsp; Quickstart

### Development

`pnpm dev`

---

### Apps

- `app`: Cabana App w/ core PoolTogether functionality on Base.

Cabana is a [Next.js](https://nextjs.org/) app with [Tailwind CSS](https://tailwindcss.com/) support, written in [TypeScript](https://www.typescriptlang.org/).

**Repo Links:** [App](https://github.com/GenerationSoftware/pooltogether-client-monorepo/tree/main/apps/app)

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
