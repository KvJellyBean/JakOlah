import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  ...compat.extends("prettier"),
  {
    ignores: ["node_modules/**", ".next/**", "out/**", "build/**"],
    rules: {
      // Disable triple slash reference for Next.js generated files
      "@typescript-eslint/triple-slash-reference": "off",

      // Accessibility rules for WCAG 2.1 AA compliance
      "@next/next/no-img-element": "error",
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/aria-props": "error",
      "jsx-a11y/aria-proptypes": "error",
      "jsx-a11y/aria-unsupported-elements": "error",
      "jsx-a11y/role-has-required-aria-props": "error",
      "jsx-a11y/role-supports-aria-props": "error",

      // Performance and best practices
      "@next/next/no-html-link-for-pages": "error",
      "@next/next/no-sync-scripts": "error",

      // TypeScript strict rules
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "warn",

      // Code quality
      "prefer-const": "error",
      "no-console": "warn",
    },
  },
];

export default eslintConfig;
