import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
  {
    rules: {
      // Data fetching di useEffect memang perlu setState — pattern valid
      // untuk client-side fetch di hooks seperti useProducts().
      "react-hooks/set-state-in-effect": "off",
      // react-hook-form's watch() tidak bisa dimemoize — known limitation
      "react-hooks/incompatible-library": "off",
    },
  },
]);

export default eslintConfig;
