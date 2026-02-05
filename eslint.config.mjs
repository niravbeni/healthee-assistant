import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // Custom rules for this project
  {
    rules: {
      // Allow setState in useEffect for client-side initialization patterns
      "react-hooks/set-state-in-effect": "off",
      // Allow refs access during render for animation patterns
      "react-hooks/refs": "off",
      // Allow immutability patterns for animation callbacks
      "react-hooks/immutability": "off",
    },
  },
]);

export default eslintConfig;
