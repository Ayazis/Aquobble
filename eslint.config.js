import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
// Node 24 strips TypeScript types natively, so the single slice list can be imported as-is.
import { SLICES as SLICE_LIST } from './slices.config.ts';

const SLICES = SLICE_LIST.join('|');

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'assets/library', 'public', 'tools', 'shots'] },
  js.configs.recommended,
  ...tseslint.configs.strict,
  prettier,
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      // Prefer many small files.
      'max-lines': ['error', { max: 150, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': ['warn', { max: 50, skipBlankLines: true, skipComments: true }],
      complexity: ['warn', 10],
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      // Slices talk to each other only through their public index (`@physics`, not `@physics/Foo`),
      // and never through relative paths that climb out of the slice.
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { regex: `^@(${SLICES})/`, message: 'Import another slice via its index, e.g. "@physics".' },
            { regex: '^(\\.\\./){2}', message: 'Do not climb out of a slice; use its @alias.' },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.test.ts'],
    rules: { 'max-lines-per-function': 'off', 'max-lines': 'off' },
  },
  {
    files: ['scripts/**', '*.config.*'],
    // Asset scripts parse untyped JSON from external APIs.
    rules: {
      'max-lines': 'off',
      'max-lines-per-function': 'off',
      complexity: 'off',
      'no-restricted-imports': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
);
