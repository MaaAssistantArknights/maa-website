# MAA Website

- 官网首页（见本仓库）: [MaaAssistantArknights/maa-website](https://github.com/MaaAssistantArknights/maa-website) -> <https://maa.plus>
- 文档站（移步主仓库）: [MaaAssistantArknights/MaaAssistantArknights/docs](https://github.com/MaaAssistantArknights/MaaAssistantArknights/tree/dev-v2/docs) -> <https://docs.maa.plus>

> 注意：文档站的评论区使用本仓库的 [Discussions](https://github.com/MaaAssistantArknights/maa-website/discussions)

## Project Overview

### Project Components

- `apps/web`: MAA official website, built with `React`, hosted at `/`

### Prerequisites

- Node.js `v24+`
- pnpm `v11+`

## Development

### 1. Set Up the Environment

Choose *ONE* of the following methods to set up your environment:

#### Local Clone

1. [Install pnpm](https://pnpm.io/installation). You could:
   - Use the [standalone script](https://pnpm.io/installation#using-corepack) without `Node.js`
   - *OR* [Install Node.js](https://nodejs.org/en/download) and install `pnpm` via [corepack](https://pnpm.io/installation#using-corepack)
   - *OR* [Install Node.js](https://nodejs.org/en/download) and install `pnpm` via [npm](https://pnpm.io/installation#using-npm)
   - *OR* Use any other method that you prefer.

2. Install dependencies with `pnpm`:

   ```shell
   pnpm install
   ```

   No need to worry about the version issues - they are already taken care of in `package.json`.

#### Remote Setup (GitHub Codespaces)

Open this repository in GitHub Codespaces. Once it's ready, the environment will be set up automatically.

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/MaaAssistantArknights/maa-website)

### 2. Run the Development Server

Execute in the *ROOT* directory:

```shell
pnpm dev
```

- `apps/web` will be hosted on `http://localhost:3000`

### 3. (Optional) Lint Code

#### General Overview

1. Prettier (global)

   Prettier is configured at the root of the repository.

   Its role is to enforce consistent code style and formatting across all apps/packages.

2. ESLint (per-app)

   ESLint is configured separately within each app/package.

   Its role is to enforce syntax rules, type checks, and framework-specific best practices (e.g., React rules).

#### Commands

Execute in the *ROOT* directory:

- Lint check

   ```shell
   pnpm lint              # Both (prettier -> eslint)
   pnpm lint:format       # Use Prettier for code formatting
   pnpm lint:code         # Use ESLint for JS/TS code
   ```

- Lint fix

   ```shell
   pnpm lintfix           # Both (prettier -> eslint)
   pnpm lintfix:format    # Use Prettier for code formatting
   pnpm lintfix:code      # Use ESLint for JS/TS code
   ```

### 4. Build the Project

Execute in the *ROOT* directory:

```shell
pnpm build
```

The build artifacts will be generated in `./dist`. You can serve them locally with:

```shell
python -m http.server -d ./dist --bind 127.0.0.1
```

or any other method that you prefer.
