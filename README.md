# maa-website

Monorepo for MAA Web frontend projects

## Projects

- `apps/web` MAA official website, build with `React`, host path `/`
- `apps/doc` MAA documantation, build with `Docusaurus`, host path `/doc`
- `packages/eslint-config-maa` MAA eslint shared configuration

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
yarn dev
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
