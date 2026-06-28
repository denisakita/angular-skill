// @ts-check
// Angular ESLint flat config — requires ESLint v9+ and angular-eslint v18+.
// Package major aligns with Angular major: use angular-eslint@21 for Angular 21,
// angular-eslint@22 for Angular 22.
//
// Install:
//   ng add angular-eslint
// (or) npm i -D angular-eslint eslint typescript-eslint @eslint/js
//
// Source: https://github.com/angular-eslint/angular-eslint (docs/CONFIGURING_ESLINT.md)

const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

module.exports = tseslint.config(
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      // Change `prefix` to your app/library prefix (set via `ng new --prefix`).
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'app', style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'app', style: 'kebab-case' },
      ],
      // Enforce modern idioms:
      '@angular-eslint/prefer-standalone': 'error',
      '@angular-eslint/prefer-on-push-component-change-detection': 'error',
      '@angular-eslint/prefer-signals': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  {
    files: ['**/*.html'],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
    rules: {},
  },
);
