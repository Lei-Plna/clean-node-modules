import { defineConfig } from 'tsup';
import extra from 'fs-extra';
import klur from 'kleur';

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
    console.log(klur.green('✅ locales copied to dist/locales'));
  }
});
