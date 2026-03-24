import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    // Next.js build outputs
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Storybook build output
    "storybook-static/**",
    // Story files (not app code — Storybook framework handles their linting)
    "stories/**",
    // Auto-generated files
    "doc/api/**",
    // Supabase local
    "supabase/.branches/**",
    "supabase/.temp/**",
  ]),
  {
    // Our source files: enforce unused vars/imports as errors
    files: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}", "lib/**/*.{ts,tsx}", "types/**/*.ts"],
    rules: {
      // Unused code → error (was warning by default)
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      // React Compiler rules: downgrade from error to warn.
      // Valid useEffect+setState patterns (initial fetch, deferred state from
      // external APIs) are incorrectly flagged as violations.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
      // The refs rule fires on direction state that was already moved out of render.
      "react-hooks/refs": "warn",
    },
  },
]);

export default eslintConfig;
