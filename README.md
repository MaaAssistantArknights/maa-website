# maa-website

> 本仓库已迁移至 [MAA 主仓库](https://github.com/MaaAssistantArknights/MaaAssistantArknights)，请勿在此仓库提交 Commits 和 Pull Request

> 请勿 Archive 此仓库，文档的评论区仍然使用此仓库的 Discussions

Monorepo for MAA Web frontend projects

- [MAA Website (Production)](https://www.maa.plus/)
- [MAA Website (Development)](https://kind-wave-001cba500-dev.eastasia.1.azurestaticapps.net/)

Build With:

![Node.JS](https://img.shields.io/badge/Node.JS-v16-339933?logo=nodedotjs)
![React](https://img.shields.io/badge/React-v18-61DAFB?logo=react)

Monorepo Technology:

![Turborepo](https://img.shields.io/badge/Turborepo-latest-EF4444?logo=turborepo)
![Yarn Workspace](https://img.shields.io/badge/Yarn_Workspace-v1-2C8EBB?logo=yarn)

Deployment Status:

![GitHub Workflow Status (main)](https://img.shields.io/github/actions/workflow/status/MaaAssistantArknights/maa-website/azure-deploy.yaml?branch=main&logo=microsoftazure&label=Azure%20Static%20Web%20Apps%20%28Production%20Build%29)
![GitHub Workflow Status (dev)](https://img.shields.io/github/actions/workflow/status/MaaAssistantArknights/maa-website/azure-deploy.yaml?branch=dev&logo=microsoftazure&label=Azure%20Static%20Web%20Apps%20%28Development%20Build%29)

## Projects

- `apps/web` MAA official website, build with `React`, host path `/`
- `apps/doc` MAA documantation, build with `VuePress`, host path `/doc`
- `packages/eslint-config-maa` MAA eslint shared configuration
- `packages/maa-react-app` MAA react app shared components
- `packages/maa-tsconfig` MAA typescript shared configuration

## Local Development

Requirements:

- NodeJS ^16.15.0
- Yarn ^1.22.19

Resolve dependencies with `yarn` in root directory

```shell
yarn
```

Start a development server

- `apps/web` will be hosted on `http://localhost:3000`
- `apps/doc` will be hosted on `http://localhost:3001/doc`

```shell
yarn dev            # Home and Doc:zh-CN
yarn dev:home       # Home ONLY
yarn dev:doc:cn     # Doc:zh-CN ONLY
yarn dev:doc:en     # Doc:en ONLY
```

Lint code

```shell
yarn lint           # All
yarn lint:js        # Use ESLint for JS/TS code
yarn lint:prettier  # Use Prettier for code formatting
```

Lint fix

```shell
yarn lintfix
```

Build release

```shell
yarn build          # This will run lint first
```
