import typescriptPlugin from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'

import prettierPlugin from 'eslint-plugin-prettier'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['**/dist/', '**/node_modules/', '**/build/']),

  // React + TypeScript
  {
    files: ['**/*.{,m,c}ts{,x}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: typescriptParser,
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
        ecmaFeatures: { jsx: true },
      },
    },

    plugins: {
      '@typescript-eslint': typescriptPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      prettier: prettierPlugin,
    },

    rules: {
      /** TypeScript 推荐规则 */
      ...typescriptPlugin.configs.recommended.rules,

      /** React 推荐规则 */
      ...reactPlugin.configs.recommended.rules,

      /** React Hooks 推荐规则 */
      ...reactHooksPlugin.configs.recommended.rules,

      /** Prettier 规则 */
      'prettier/prettier': ['warn'],

      /** 自定义项目偏好 */
      'react/react-in-jsx-scope': 'off', // React 17+ 不需要
    },

    settings: {
      react: {
        version: 'detect',
      },
    },
  },
])
