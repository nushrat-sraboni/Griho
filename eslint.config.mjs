// eslint.config.mjs
//
// ESLint is a spell-checker for code. It spots likely mistakes before the
// app runs. This file is its rule book for the whole repo.
// Run it with: npm run lint

import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    // Folders ESLint must skip: installed libraries, build output, database files.
    ignores: ['**/node_modules/**', '**/.expo/**', '**/dist/**', '**/web-build/**', 'supabase/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
);
