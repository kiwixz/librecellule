import path from 'node:path';
import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import { defineConfig } from 'eslint/config';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import svelteConfig from './svelte.config.js';
import ts from 'typescript-eslint';

export default defineConfig(
  includeIgnoreFile(path.resolve('.gitignore')),
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs.recommended,
  stylistic.configs.recommended,

  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      'no-undef': 'off',

      '@stylistic/member-delimiter-style': ['error', {
        multiline: { delimiter: 'semi' },
        singleline: { delimiter: 'semi' },
      }],
      '@stylistic/semi': ['error', 'always'],
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
);
