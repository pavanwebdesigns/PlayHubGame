import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-unused-expressions': 'error',
      // Static export uses full page loads. next/link would put the client router on every page.
      '@next/next/no-html-link-for-pages': 'off',
    },
  },
  globalIgnores([
    'legacy/**',
    'data/**',
    'public/data/**',
    'dist/**',
    'dist-ssr/**',
    'out/**',
    '.next/**',
    '.lighthouseci/**',
  ]),
]);
