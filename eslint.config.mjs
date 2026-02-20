import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: [
      ".next/**", "node_modules/**", ".vercel/**", "out/**", 
      "dist/**", "coverage/**", "tests/**",
      "**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts", "**/*.spec.tsx",
      "*.config.js", "*.config.ts", "*.config.mjs",
      "scripts/**", "*.md", "doctoralia_scraper/**",
      ".windsurf/**", ".claude/**", "legacy/**",
      "**/examples/**", "**/usage-examples.ts", "src/types/**",
      "**/*.d.ts", "monitoring/**", "netlify/**", "public/sw.js",
      "eslint-plugin-custom/**", "lighthouserc.js",
      "src/lib/supabase.js", "src/hooks/usePerformance.js",
      "src/components/Avatar.tsx"
    ]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json"
      }
    },
    rules: {
      // Solo reglas críticas
      "no-console": ["error", { allow: ["warn", "error", "info"] }],
      
      // Todo lo demás OFF
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "no-unused-vars": "off",
      "no-undef": "off",
      "no-useless-escape": "off",
      "no-useless-assignment": "off",
      "prefer-const": "off",
      "no-case-declarations": "off",
      "no-constant-binary-expression": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-require-imports": "off",
      "preserve-caught-error/catch-error-cause": "off",
      "preserve-caught-error": "off"
    }
  }
];
