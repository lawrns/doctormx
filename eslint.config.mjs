import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import next from "@next/eslint-plugin-next";
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const customPlugin = require("./eslint-plugin-custom/index.js");

export default [
  {
    ignores: [".next/**", "node_modules/**", ".vercel/**", "out/**", "dist/**", "coverage/**"]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.strict,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      },
      parserOptions: {
        project: "./tsconfig.json"
      }
    },
    plugins: {
      "@next/next": next
    },
    rules: {
      ...next.configs.recommended.rules,
      ...next.configs["core-web-vitals"].rules,
      
      // ============================================
      // QUALITY GATES - ZERO WARNINGS POLICY
      // ============================================
      
      // No console.log in production code
      "no-console": ["error", { 
        allow: ["warn", "error", "info"] 
      }],
      
      // No debugger statements
      "no-debugger": "error",
      
      // No TODO/FIXME comments (use issue tracker instead)
      "no-warning-comments": ["warn", { 
        terms: ["TODO", "FIXME", "HACK", "XXX"],
        location: "start"
      }],
      
      // ============================================
      // NAMING CONVENTIONS
      // ============================================
      
      // camelCase for variables and functions
      "camelcase": ["error", { 
        properties: "always",
        ignoreDestructuring: false,
        ignoreImports: false,
        ignoreGlobals: false
      }],
      
      // PascalCase for components (React components, classes, interfaces, types)
      "@typescript-eslint/naming-convention": [
        "error",
        // camelCase for variables
        {
          selector: "variable",
          format: ["camelCase", "UPPER_CASE"],
          leadingUnderscore: "allow",
          trailingUnderscore: "forbid"
        },
        // PascalCase for React components (variables in JSX files that return JSX)
        {
          selector: "variable",
          types: ["function"],
          format: ["PascalCase", "camelCase"],
          leadingUnderscore: "allow"
        },
        // PascalCase for type aliases and interfaces
        {
          selector: "typeAlias",
          format: ["PascalCase"],
          leadingUnderscore: "forbid",
          trailingUnderscore: "forbid"
        },
        {
          selector: "interface",
          format: ["PascalCase"],
          leadingUnderscore: "forbid",
          trailingUnderscore: "forbid",
          prefix: ["I"]
        },
        // PascalCase for classes
        {
          selector: "class",
          format: ["PascalCase"],
          leadingUnderscore: "forbid",
          trailingUnderscore: "forbid"
        },
        // camelCase for functions
        {
          selector: "function",
          format: ["camelCase", "PascalCase"],
          leadingUnderscore: "allow"
        },
        // UPPER_CASE for constants and enums
        {
          selector: "enum",
          format: ["PascalCase"],
          leadingUnderscore: "forbid"
        },
        {
          selector: "enumMember",
          format: ["UPPER_CASE", "PascalCase"],
          leadingUnderscore: "forbid"
        },
        // camelCase for object properties
        {
          selector: "objectLiteralProperty",
          format: ["camelCase", "snake_case"],
          leadingUnderscore: "allow"
        },
        // camelCase for object methods
        {
          selector: "objectLiteralMethod",
          format: ["camelCase"],
          leadingUnderscore: "allow"
        },
        // camelCase for parameters
        {
          selector: "parameter",
          format: ["camelCase"],
          leadingUnderscore: "allow",
          trailingUnderscore: "forbid"
        }
      ],
      
      // ============================================
      // EXPLICIT RETURN TYPES
      // ============================================
      
      // Require explicit return types on exported/public functions
      "@typescript-eslint/explicit-function-return-type": ["error", {
        allowExpressions: false,
        allowTypedFunctionExpressions: true,
        allowHigherOrderFunctions: true,
        allowDirectConstAssertionInArrowFunctions: true,
        allowConciseArrowFunctionExpressionsStartingWithVoid: false
      }],
      
      // Require explicit return types on class methods
      "@typescript-eslint/explicit-member-accessibility": ["error", {
        accessibility: "explicit",
        overrides: {
          constructors: "no-public"
        }
      }],
      
      // ============================================
      // STRICT TYPE CHECKING
      // ============================================
      
      "@typescript-eslint/no-empty-object-type": ["error", { 
        allowObjectTypes: "always" 
      }],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": ["error", { 
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_"
      }],
      "@typescript-eslint/consistent-type-imports": ["error", {
        prefer: "type-imports",
        fixStyle: "inline-type-imports"
      }],
      
      // ============================================
      // CODE QUALITY
      // ============================================
      
      "eqeqeq": ["error", "always"],
      "no-var": "error",
      "prefer-const": "error",
      "no-throw-literal": "error",
      "prefer-promise-reject-errors": "error",
      "no-return-await": "error",
      "require-await": "error"
    }
  },
  // ============================================
  // CUSTOM PLUGIN - i18n NO HARDCODED STRINGS
  // ============================================
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "custom": customPlugin
    },
    rules: {
      // Prohibir strings hardcodeados en español
      "custom/no-hardcoded-spanish": ["error", {
        minLength: 3,
        ignoredWords: [
          // Nombres propios de personas (ejemplos)
          "Dr. Simeon", "Dr Simeon", "Simeon",
          // Términos específicos del dominio médico que pueden ser proper nouns
          "DoctorMX", "Doctor MX",
          // Añadir más nombres propios según sea necesario
        ]
      }]
    }
  },
  // Relaxed rules for scripts
  {
    files: ["scripts/**/*.{js,mjs}", "*.config.{js,mjs,ts}", "eslint-plugin-custom/**/*"],
    rules: {
      "no-console": "off",
      "no-undef": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "custom/no-hardcoded-spanish": "off"
    }
  },
  // Relaxed rules for test files
  {
    files: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}", "**/tests/**/*"],
    rules: {
      "no-console": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/naming-convention": "off",
      "custom/no-hardcoded-spanish": "off"
    }
  },
  // Relaxed rules for Next.js API routes (return types handled by Next.js)
  {
    files: ["src/app/api/**/*", "src/pages/api/**/*"],
    rules: {
      "@typescript-eslint/explicit-function-return-type": "off"
    }
  }
];
