import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['scripts/*.ts'],
  outDir: 'scripts-dist',
  format: ['cjs'],
  platform: 'node',
  sourcemap: true,
  clean: true
});
