import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'

const MAX_NESTED_CALLBACKS = 3

export default tseslint.config(
  {
    ignores: [
      'eslint.config.ts',
      'dist/**',
      'node_modules/**',
      '.vite/**',
      'build/**',
    ],
  },

  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,

  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.js',
    ],

    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },

    rules: {
      // === TYPE SAFETY ===

      '@typescript-eslint/no-explicit-any':
        'error',

      '@typescript-eslint/no-unsafe-argument':
        'error',

      '@typescript-eslint/no-unsafe-assignment':
        'error',

      '@typescript-eslint/no-unsafe-call':
        'error',

      '@typescript-eslint/no-unsafe-member-access':
        'error',

      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],

      // === LANGUAGE SAFETY ===

      'eqeqeq': [
        'error',
        'always',
      ],

      // === ANTI-MEMLEAK & HEAP HARDENING ===

      'no-loop-func':
        'error',

      'no-implicit-globals':
        'error',

      '@typescript-eslint/no-unnecessary-qualifier':
        'error',

      // === ANTI-NULL POINTER & ARRAY HARDENING ===

      '@typescript-eslint/no-unnecessary-condition':
        'error',

      '@typescript-eslint/require-array-sort-compare':
        'error',

      '@typescript-eslint/no-base-to-string':
        'error',

      // === SCOPE & DEPENDENCY SAFETY ===

      '@typescript-eslint/no-namespace':
        'error',

      '@typescript-eslint/no-shadow': [
        'error',
        {
          builtinGlobals: true,
          hoist: 'all',
        },
      ],

      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'separate-type-imports',
        },
      ],

      // === ANTI-NEGLIGENCE LOGIC ===

      'consistent-return':
        'error',

      '@typescript-eslint/no-non-null-assertion':
        'error',

      '@typescript-eslint/no-misused-spread':
        'error',

      '@typescript-eslint/no-extraneous-class':
        'error',

      // === ASYNC & THREE.JS LOGIC SAFETY ===

      '@typescript-eslint/no-floating-promises':
        'error',

      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksVoidReturn: true,
        },
      ],

      'no-await-in-loop':
        'error',

      '@typescript-eslint/restrict-plus-operands':
        'error',

      '@typescript-eslint/no-unnecessary-type-assertion':
        'error',

      '@typescript-eslint/strict-boolean-expressions': [
        'error',
        {
          allowString: false,
          allowNumber: false,
          allowNullableObject: true,
        },
      ],

      '@typescript-eslint/no-array-constructor':
        'error',

      '@typescript-eslint/no-dynamic-delete':
        'error',

      'no-eval':
        'error',

      'no-param-reassign': [
        'error',
        {
          props: true,
        },
      ],

      'no-floating-decimal':
        'error',

      // === LOW LEVEL STUFF ===

      'max-nested-callbacks': [
        'error',
        MAX_NESTED_CALLBACKS,
      ],

      'no-unmodified-loop-condition':
        'error',

      'no-nested-ternary':
        'error',

      'no-mixed-operators': [
        'error',
        {
          allowSamePrecedence: true,
        },
      ],

      'no-bitwise':
        'error',

      'no-sync':
        'error',

      'no-self-compare':
        'error',

      // === MORE HARDENING ===

      '@typescript-eslint/no-require-imports':
        'error',

      '@typescript-eslint/prefer-reduce-type-parameter':
        'error',

      '@typescript-eslint/no-meaningless-void-operator':
        'error',

      '@typescript-eslint/no-confusing-void-expression': [
        'error',
        {
          ignoreArrowShorthand: true,
        },
      ],

      'no-async-promise-executor':
        'error',

      'no-promise-executor-return':
        'error',

      'no-caller':
        'error',

      'no-extend-native':
        'error',

      'no-labels':
        'error',
    },
  },
)