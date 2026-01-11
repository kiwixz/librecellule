import { fileURLToPath } from 'node:url'
import { defineConfig } from 'eslint/config'
import { includeIgnoreFile } from '@eslint/compat'
import js from '@eslint/js'
import ts from 'typescript-eslint'
import svelte from 'eslint-plugin-svelte'
import globals from 'globals'
import svelteConfig from './svelte.config.js'
import stylistic from '@stylistic/eslint-plugin'

const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url))

export default defineConfig(
  includeIgnoreFile(gitignorePath),
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs.recommended,
  stylistic.configs.recommended,
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      'no-undef': 'off',
    },
  },
  {
    files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        extraFileExtensions: ['.svelte'],
        parser: ts.parser,
        svelteConfig,
      },
    },
  },
)
