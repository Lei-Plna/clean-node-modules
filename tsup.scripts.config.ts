import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['scripts/i18n-sync.ts'],
  outDir: 'scripts-dist',
  format: ['cjs'],
  platform: 'node',
  sourcemap: true,
  clean: true
});
