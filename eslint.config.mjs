import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

/**
 * Flat config, ESLint 9. Composition order matters: recommended sets first, repo rules next,
 * context overrides after, and `eslint-config-prettier` LAST so it can switch off every
 * stylistic rule Prettier already owns.
 */
export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'dist-clean/**',
      'dist-seeded/**',
      '.verify/**',
      '.vercel/**',
      'node_modules/**',
      'coverage/**',
      'src/constants/generated/**',
      '**/*.d.ts',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser },
    },
    plugins: { react, 'react-hooks': reactHooks },
    settings: { react: { version: '18.2' } },
    rules: {
      ...reactHooks.configs.recommended.rules,

      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],
      '@typescript-eslint/ban-ts-comment': 'error',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-shadow': 'error',
      'no-shadow': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      'no-console': 'error',
      'no-debugger': 'error',
      'no-alert': 'error',
      eqeqeq: 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'no-duplicate-imports': 'error',
      'no-return-await': 'error',
      'no-throw-literal': 'error',
      'no-param-reassign': ['error', { props: false }],
      'max-lines': ['warn', { max: 350, skipBlankLines: true, skipComments: true }],

      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/self-closing-comp': 'error',
      'react/jsx-filename-extension': ['error', { extensions: ['.tsx'] }],

      // ── Fixture determinism ────────────────────────────────────────────────────────
      // A fixture whose output drifts between builds cannot support byte-identical
      // snapshot assertions or build-over-build diffing. These bans are the enforcement.
      'no-restricted-syntax': [
        'error',
        {
          selector: "NewExpression[callee.name='Date']",
          message: 'Fixture determinism: use BUILD_NOW from @/constants/time.',
        },
        {
          selector: "MemberExpression[object.name='Date'][property.name='now']",
          message: 'Fixture determinism: use BUILD_NOW from @/constants/time.',
        },
        {
          selector: "MemberExpression[object.name='Math'][property.name='random']",
          message: 'Fixture determinism: no randomness anywhere in the fixture.',
        },
        {
          selector: "NewExpression[callee.object.name='Intl']",
          message:
            'Fixture determinism: ICU output varies by Node version. Pre-format in content/data/*.json. Exempt: src/utils/format.ts.',
        },
      ],
      'no-restricted-globals': [
        'error',
        { name: 'fetch', message: 'Fixture determinism: no runtime network. Bundle the data.' },
      ],
    },
  },

  // The two files allowed to touch Intl / Date, both narrowly scoped and asserted at build time.
  {
    files: ['src/utils/format.ts', 'src/utils/datetime.ts'],
    rules: { 'no-restricted-syntax': 'off' },
  },

  // PostCSS and Tailwind config are CommonJS and run in Node.
  {
    files: ['**/*.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: { ...globals.node },
    },
  },

  // Build scripts run in Node and legitimately print progress.
  {
    files: ['scripts/**/*.ts', 'vite.config.ts'],
    languageOptions: { globals: { ...globals.node } },
    rules: {
      'no-console': 'off',
      'no-restricted-globals': 'off',
      'no-restricted-syntax': 'off',
    },
  },

  prettier,
);
