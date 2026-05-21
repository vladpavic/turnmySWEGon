import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      // Warn on unused variables but ignore ones prefixed with _
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      // Allow `any` type without erroring — remove if you want stricter TS
      "@typescript-eslint/no-explicit-any": "warn",
    },
  }
);