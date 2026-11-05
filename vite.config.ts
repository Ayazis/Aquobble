import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import { SLICES } from './slices.config';

const src = (p: string) => fileURLToPath(new URL(`./src/${p}`, import.meta.url));

export default defineConfig({
  // Relative base so the build works at https://<user>.github.io/Aquobble/
  base: './',
  resolve: {
    alias: SLICES.flatMap((s) => [
      { find: new RegExp(`^@${s}$`), replacement: src(`${s}/index.ts`) },
      { find: new RegExp(`^@${s}/`), replacement: src(`${s}/`) },
    ]),
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', '*.test.ts'],
  },
});
