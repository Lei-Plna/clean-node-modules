import { defineConfig } from 'tsup';
import extra from 'fs-extra';
import chalk from 'chalk';

export default defineConfig({
  entry: ['src/**/*.ts'],
  outDir: 'dist',
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  target: 'node16',
  bundle: false,
  onSuccess: async () => {
    extra.copySync('src/locales', 'dist/locales');
    console.log(chalk.green('✅ locales copied to dist/locales'));
  },
  banner: {
    js: '#!/usr/bin/env node'
  }
});
